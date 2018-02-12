---
title: "Writing JavaScript components with jQuery"
date: 2018-02-12 12:20:00 +8
description: jQuery is OK
---

I know I know. “jQuery? That’s sooo 2013…” But actually, there are lots of reasons why you might want to use jQuery over other frameworks. Here are some of mine:

* You don’t want to use React/Vue/Angular because it’s overkill for what you want to do
* You don’t want to render your interface using JavaScript
* You want to use a jQuery based library/plugin
* You’re not the only front-end dev in your team and everyone has to study the framework if you want to use one

Not to say that you shouldn’t use React/Vue/Angular; I use React all the time. But I recognize that it doesn’t fit all the use-cases. So for the basic stuff, I stick to jQuery.

## On with it then
So first thing’s first, let’s start with the assumptions.

* You’re using ES6
* You’re using Webpack/Browserify or something similar to compile your JS
* You’re using npm based libraries

If you’re not familiar with the technologies I just listed, then I suggest you first read up on modern JavaScript. It might be painful at first, but trust me it’s totally worth it. Modern JavaScript is _really_ good. It’s what allowed me to write maintainable jQuery code with little fuss. Here are a few resources to get you started.

* [Introduction to commonly used ES6 features](https://zellwk.com/blog/es6/)
* [http://es6-features.org](http://es6-features.org)

## Think Components™️
For this blog post, I’m going to define a component as a **user interface element that only cares about itself**. Any code you write should only affect the component’s internals, and the component should be able to function independently. The only way for a component to affect and be affected by externalities is through event handlers and public methods.

## Enough about theory. Let’s write some code.

![:(](/assets/images/writing-javascript-components-with-jquery/carousel-screenshot.png ":(")

<a href="/assets/demos/javascript-components" target="_blank">Open demo</a> \| <a href="https://gist.github.com/mixxorz/fc73019330ba023b84a3b79bc429a562" target="_blank">Full source code</a>

We’re going to build a carousel! Basic stuff. We have some arrows that navigate the slides. Also we have those dot things.

_Sidenote: We won’t focus on building out the styles for this. This blog post is all about the JavaScript._

Experience tells me that we can split this up into four components.

1. CarouselSlider - the sliding bit
2. CarouselDots - the dots on the bottom
3. CarouselControls - the left and right arrows
4. CarouselBlock - ties the previous three components up and orchestrates interactions between them

We'll put each component in its own js file.

> Sometimes components are simpler and don’t need to be broken down further, but I wanted to show a fairly complex example.  

### The HTML
We’ll start by writing the markup because it’ll be hard to write styles and JS without it. Here’s the markup I came up with.

```html
<div class="carousel-block">
  <div class="carousel-slider">
    <ul class="carousel-slider__slide-list">
      <li class="carousel-slider__slide">
        <img src="https://placehold.it/1280x800?text=1" alt="Horse 1">
      </li>
      <!-- More slides here -->
    </ul>
  </div>

  <div class="carousel-controls">
    <button class="carousel-controls__button carousel-controls__prev">◀</button>
    <button class="carousel-controls__button carousel-controls__next">▶</button>
  </div>

  <div class="carousel-dots">
    <button class="carousel-dots__dot carousel-dots__dot--active"></button>
    <button class="carousel-dots__dot"></button>
    <!-- More dots here -->
  </div>
</div>
```

The markup has four parts, `carousel-slider`, `carousel-controls`, `carousel-dots`, and the main wrapper `carousel-block`. These elements represent our four components.

The styles aren’t really relevant to what we’re building so I’ll omit them from the post. The only thing worth mentioning is the `carousel-dots__dot--active` class controls the dot’s active state.

### CarouselSlider.js
This component is responsible for rendering the slides themselves. Let’s take a look at the source code.

```javascript
import $ from 'jquery'

class CarouselSlider {
  constructor({root}) {
    // Select HTML nodes
    this.root = $(root)
    this.slides = this.root.find('.carousel-slider__slide')
    this.slideList = this.root.children('.carousel-slider__slide-list')
  }

  get slideCount() {
    return this.slides.length
  }

  slideTo(index) {
    // The transform property controls the position of the slider
    this.slideList.css({transform: `translateX(-${100 * index}%)`});
  }
}

export default CarouselSlider
```

There’s quite a bit going on here so let’s go through the interesting bits.

```javascript
import $ from 'jquery'
```

That’s right. No global jQuery. We install it via npm and import it in our code.

```javascript
class CarouselSlider {
  constructor({root}) {
    this.root = $(root)
```

Here we define a `CarouselSlider` class which takes a `root` parameter in its constructor. `root` serves as the top-level element of this component. Accepting the root element in the constructor makes it easier to reuse the component because it allows us to create more than a single instance of this component, linked to different HTML nodes.

```javascript
    this.slideList = this.root.children('.carousel-slider__slide-list')
    this.slides = this.slideList.children('.carousel-slider__slide')
  }
```

Here we’re selecting the root’s child components, the `slideList` and all the `slide`s

```javascript
  get slideCount() {
    return this.slides.length
  }
```

A getter that returns the number of slides present in the carousel.

```javascript
  slideTo(index) {
    this.slideList.css({transform: `translateX(-${100 * index}%)`});
  }
```

A method that flips the carousel to the slide on the given `index`. In this example, I implemented the slider using transforms.

Let’s look at how we can use the `CarouselSlider` class.

```javascript
const slider = new CarouselSlider({root: '.carousel-slider'})
console.log(slider.slideCount) // Prints out the number of slides
console.log(slider.slideTo(1)) // Slides to the second slide
```

Awesome right? We wrote all that code so that we can control the slider without having to call any low-level jQuery methods.

## CarouselDots.js
We’re doing something special in this component. We want to be able to click on a dot and for the slider to slide to that dot’s slide.

```javascript
import $ from 'jquery'
import EventEmitter from 'eventemitter3'

class CarouselDots extends EventEmitter {
  constructor({root}) {
    super()
    this.root = $(root)
    this.dots = this.root.children('.carousel-dots__dot')

    // Bind events
    this.dots.on('click', ev => this._handleClick(ev))
  }

  _handleClick(ev) {
    ev.preventDefault()
    const index = this.dots.index(ev.target)
    this.highlightDot(index)

    // Fire the clickdot event
    this.emit('clickdot', index)
  }

  highlightDot(index) {
    this.dots.removeClass('carousel-dots__dot--active')
    this.dots.eq(index).addClass('carousel-dots__dot--active')
  }
}

export default CarouselDots
```

We’re used to being able to use the `on` method with jQuery objects to listen to click/change/etc. events, but did you know that we can also fire our own custom events? That’s what `EventEmitter` is for. We extend `CarouselDots` from `EventEmitter` so that we can attach event listeners to the `CarouselDots` instance.

Here’s how that’s used:

```javascript
const dots = new CarouselDots({root: '.carousel-dots'})
dots.on('clickdot', index => console.log(`Clicked dot ${index}`))
```

We set the `clickdot` event to be fired in the `_handleClick` method. `_handleClick` is called when one of our dots is clicked. We figure out which dot triggered the event, and emit the `clickdot` event with `this.emit('clickdot', index)`. All the listeners will then be called, passing in the `index`.

**Emitting and handling events is what ties all our components together.**

There’s another method on `CarouselDots` called `highlightDot`. It does what it says on the tin: you pass in an index and it’ll highlight that dot.

> In this example, we're using [eventemitter3](https://www.npmjs.com/package/eventemitter3) as our event emitter library. Node has it's own built-in event emitter, but I like eventemitter3 because it's optimized to work in the browser.

## CarouselControls.js

```javascript
import $ from 'jquery'
import EventEmitter from 'eventemitter3'

class CarouselControls extends EventEmitter {
  constructor({root}) {
    super()
    this.root = $(root)
    this.buttons = this.root.children('.carousel-controls__button')

    this.buttons.on('click', ev => this._handleClick(ev))
  }

  _handleClick(ev) {
    ev.preventDefault()

    const target = $(ev.target)

    // Fire clicknext or clickprev, depending on which button was clicked
    if (target.hasClass('carousel-controls__next')) {
      this.emit('clicknext')
    } else {
      this.emit('clickprev')
    }
  }
}

export default CarouselControls
```

Again we’re using `EventEmitter` for this component. This time, we’re firing the `clicknext` or `clickprev` events when the left or right buttons are clicked. Unlike the previous component, we don’t pass any data along with our event.

```javascript
const controls = new CarouselControls({root: '.carousel-controls'})
controls.on('clicknext', () => console.log('Next was clicked'))
controls.on('clickprev', () => console.log('Prev was clicked'))
```

## CarouselBlock.js
This is where it all comes together.

```javascript
import $ from 'jquery'

import CarouselControls from '../CarouselControls'
import CarouselDots from '../CarouselDots'
import CarouselSlider from '../CarouselSlider'
import mod from '../../../lib/mod' // custom modulo function

class CarouselBlock {
  constructor({root}) {
    this.root = $(root)

    // Instantiate sub-components
    this.slides = new CarouselSlider({
      root: this.root.children('.carousel-slider')[0]
    })
    this.controls = new CarouselControls({
      root: this.root.children('.carousel-controls')[0]
    })
    this.dots = new CarouselDots({
      root: this.root.children('.carousel-dots')[0]
    })

    this.currentIndex = 0

    this.controls.on('clicknext', () => this.nextSlide())
    this.controls.on('clickprev', () => this.prevSlide())
    this.dots.on('clickdot', index => this.slideTo(index))
  }

  slideTo(index) {
    this.slides.slideTo(index)
    this.dots.highlightDot(index)
    this.currentIndex = index
  }

  nextSlide() {
    // We use modulo here to keep index from going out of bounds.
    let nextIndex = mod(this.currentIndex + 1, this.slides.slideCount)
    this.slideTo(nextIndex)
  }

  prevSlide() {
    let prevIndex = mod(this.currentIndex - 1, this.slides.slideCount)
    this.slideTo(prevIndex)
  }
}

export default CarouselBlock
```

We create an instance of each of the sub-components in the constructor. We attach event listeners to `clicknext`, `clickprev`, and `clickdot` events, which when called will call the appropriate methods. We also keep track of the currently displayed slide with the `currentIndex` variable. This is our single source of truth for which slide is currently displayed.

We have three methods, `slideTo`, `nextSlide`, and `prevSlide`. 

* `slideTo` just takes an index and calls methods on `slider` and `dots` to update their state.
* `nextSlide` calculates what the next index should be (using the modulo operator) and calls `slideTo`
* ditto for `prevSlide`, except it calculates what the previous index should be.

As a bonus, we can also use these methods on the `CarouselBlock` instance.

```javascript
const carousel = new CarouselBlock({root: '.carousel-block'})
carousel.nextSlide()
carousel.prevSlide()
carousel.slideTo(0)
```

This will be useful if we want to incorporate additional complexity to the carousel, like adding a timer that scrolls the slide every X seconds or something.

Since we’re passing in `root` in the constructor, we can have multiple independent instances of `CarouselBlock`.

```javascript
const carousel1 = new CarouselBlock({root: '#carousel1'})
const carousel2 = new CarouselBlock({root: '#carousel2'})
```

So that's it, pretty much.

## Do I really need jQuery?

Not really. If you can do with something lighter like Zepto.js, or even just Vanilla javascript, then that's your call. What makes this approach great isn't really jQuery, but the independent structure of each component, communicating only through public methods and event listeners.

Now go forth and write better javascript! 🍻

