# Odin Frontend

Requires Node `v4.1.x`+ and NPM `v2.14.x`+.

Originally built with Node `v8.11.3` and NPM `v5.6.0`.

## Setup

```
npm install
```

## Run Dev server

```
npm start
```

## Single build

```
npm run build
```

## Testing

Testing does not currently work. Need to convert runner over to Chrome.

```
npm test
```

Live:

```
npm test-watch
```

## Route Registration

### Page title

A route can register a page title suffix with the `pageTitle` attribute.

### Main Navigation

In order to register a route into the main navigation, simply use the `mainNav` attribute.

As an example:

```js
.state({
  name: 'clientList',
  url: '/clients',
  component: 'clientsPage',
  pageTitle: 'Clients',
  mainNav: {
    title: 'Clients',
    position: -90
  }
});
```

This registers the `Client` button with a position of `-90`, meaning it'll be just right of the
  "Dashboard" button as that has a position of `-100`. Regular entries should have positive
  numbers. If no value is specified for `position`, it will default to `0`.
