# Spin: a Bootstrap-based Ghost theme

A SaaS-focused Ghost theme built with [Bootstrap](https://getbootstrap.com/), the most popular HTML5 framework.

**Functionality**:
* Pass gscan without warnings
* Integrate Bootstrap with minimal impact to site performance.
* Use SASS for CSS.
* No jQuery.  All async/defer Javascript.
* Professionally maintained and documented.

**Features**:
* Subscribe and contact forms.
* Full-text search.
* Responsive theme images.
* Sane/documented/reusable build environment


## Prerequisites
* NodeJS (v12.13.x)
* git (optional)

## Setup
Either clone this repo or download the tarball/zip file, then install the package
dependencies.

```shell script
npm install
```

## Build
After setup is completed (once), the build commands are essentially the same as
the default Casper theme.

```shell script
npm run zip
```

There is also a development mode that supports livereload.
```shell script
npm run dev
```

## Installation
After `zip` completes successfully, install the resulting bundle from the
`dist` directory using the Ghost admin interface.

***

This repository is maintained by [Mindspun](https://www.mindspun.com).