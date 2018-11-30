import $ from 'jquery'
import Util from './util'

/**
 * --------------------------------------------------------------------------
 * Bootstrap (v4.1.3): scrollspy.js
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * --------------------------------------------------------------------------
 */

/**
 * ------------------------------------------------------------------------
 * Constants
 * ------------------------------------------------------------------------
 */

// Setting constants for Scrollspy
const NAME               = 'scrollspy'
const VERSION            = '4.1.3'
// why is DATA_KEY set to bs.scrollspy?
const DATA_KEY           = 'bs.scrollspy'
const EVENT_KEY          = `.${DATA_KEY}`
const DATA_API_KEY       = '.data-api'
const JQUERY_NO_CONFLICT = $.fn[NAME]

// set default constants for offset, method, and target
const Default = {
  offset : 10,
  method : 'auto',
  target : ''
}

// set default types for offset, method, and target
const DefaultType = {
  offset : 'number',
  method : 'string',
  target : '(string|element)'
}

// set events for on() method
const Event = {
  ACTIVATE      : `activate${EVENT_KEY}`,
  SCROLL        : `scroll${EVENT_KEY}`,
  LOAD_DATA_API : `load${EVENT_KEY}${DATA_API_KEY}`
}

// set class names
const ClassName = {
  DROPDOWN_ITEM : 'dropdown-item',
  DROPDOWN_MENU : 'dropdown-menu',
  ACTIVE        : 'active'
}

// set selectors
const Selector = {
  DATA_SPY        : '[data-spy="scroll"]',
  ACTIVE          : '.active',
  NAV_LIST_GROUP  : '.nav, .list-group',
  NAV_LINKS       : '.nav-link',
  NAV_ITEMS       : '.nav-item',
  LIST_ITEMS      : '.list-group-item',
  DROPDOWN        : '.dropdown',
  DROPDOWN_ITEMS  : '.dropdown-item',
  DROPDOWN_TOGGLE : '.dropdown-toggle'
}

// set offset method for offset and position
const OffsetMethod = {
  OFFSET   : 'offset',
  POSITION : 'position'
}

/**
 * ------------------------------------------------------------------------
 * Class Definition
 * ------------------------------------------------------------------------
 */

// define object constructor method for Scrollspy class
class ScrollSpy {
  constructor(element, config) {
    this._element       = element
    // if element.tagName is equal to BODY, return window, otherwise return element
    this._scrollElement = element.tagName === 'BODY' ? window : element
    this._config        = this._getConfig(config)
    this._selector      = `${this._config.target} ${Selector.NAV_LINKS},` +
                          `${this._config.target} ${Selector.LIST_ITEMS},` +
                          `${this._config.target} ${Selector.DROPDOWN_ITEMS}`
    this._offsets       = []
    this._targets       = []
    this._activeTarget  = null
    this._scrollHeight  = 0

    $(this._scrollElement).on(Event.SCROLL, (event) => this._process(event))

    this.refresh()
    this._process()
  }

  // Getters

// set getters for public static field with VERSION and Default keywords, these
// return VERSION and Default respectively
  static get VERSION() {
    return VERSION
  }

  static get Default() {
    return Default
  }

  // Public

// set refresh public method
  refresh() {
    // if scrollElement is equal to scrollElement.window, then return OFFSET,
    // otherwise, return POSITION.  --> What are OFFSET and POSITION in reference to?
    const autoMethod = this._scrollElement === this._scrollElement.window
      ? OffsetMethod.OFFSET : OffsetMethod.POSITION

    // if config.method is equal to auto, return autoMethod, otherwise return
    // config.method. --> What is this._config.method referring to?
    const offsetMethod = this._config.method === 'auto'
      ? autoMethod : this._config.method

    // if offsetMethod is equal to POSITION, return vertical position, otherwise
    // return 0
    const offsetBase = offsetMethod === OffsetMethod.POSITION
      ? this._getScrollTop() : 0

// set _offsets and _targets as empty arrays
    this._offsets = []
    this._targets = []

// set scrollHeight to scrollHeight or minimum height element would require to fit
// in viewport without using a vertical scrollbar
    this._scrollHeight = this._getScrollHeight()

// create an array called targets that includes all of the nav links, list items,
// and dropdown items
    const targets = [].slice.call(document.querySelectorAll(this._selector))

// map, filter, sort, and forEach? targets array --> Not exactly sure what this is doing?
    targets
      .map((element) => {
        let target
        const targetSelector = Util.getSelectorFromElement(element)

        if (targetSelector) {
          target = document.querySelector(targetSelector)
        }

        if (target) {
          const targetBCR = target.getBoundingClientRect()
          if (targetBCR.width || targetBCR.height) {
            // TODO (fat): remove sketch reliance on jQuery position/offset
            return [
              $(target)[offsetMethod]().top + offsetBase,
              targetSelector
            ]
          }
        }
        return null
      })
      .filter((item) => item)
      .sort((a, b) => a[0] - b[0])
      .forEach((item) => {
        this._offsets.push(item[0])
        this._targets.push(item[1])
      })
  }

// define dispose method, clear relevant information that is no longer needed
  dispose() {
    $.removeData(this._element, DATA_KEY)
    $(this._scrollElement).off(EVENT_KEY)

    this._element       = null
    this._scrollElement = null
    this._config        = null
    this._selector      = null
    this._offsets       = null
    this._targets       = null
    this._activeTarget  = null
    this._scrollHeight  = null
  }

  // Private

// get Config details, is this to help define the type of the config in case it's not clearly defined?
  _getConfig(config) {
    config = {
      // What does the ... mean?
      ...Default,
      ...typeof config === 'object' && config ? config : {}
    }

    if (typeof config.target !== 'string') {
      let id = $(config.target).attr('id')
      if (!id) {
        id = Util.getUID(NAME)
        $(config.target).attr('id', id)
      }
      config.target = `#${id}`
    }

    Util.typeCheckConfig(NAME, config, DefaultType)

    return config
  }

// return ScrollTop or vertical scrollbar position
  _getScrollTop() {
    return this._scrollElement === window
      ? this._scrollElement.pageYOffset : this._scrollElement.scrollTop
  }

// return entire height of the element
  _getScrollHeight() {
    return this._scrollElement.scrollHeight || Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight
    )
  }

// return height of the browser window's viewport
  _getOffsetHeight() {
    return this._scrollElement === window
      ? window.innerHeight : this._scrollElement.getBoundingClientRect().height
  }

// set height values so that it refreshes and resets values when needed to maintain
// proper target values?
  _process() {
    const scrollTop    = this._getScrollTop() + this._config.offset
    const scrollHeight = this._getScrollHeight()
    const maxScroll    = this._config.offset +
      scrollHeight -
      this._getOffsetHeight()

    if (this._scrollHeight !== scrollHeight) {
      this.refresh()
    }

    if (scrollTop >= maxScroll) {
      const target = this._targets[this._targets.length - 1]

      if (this._activeTarget !== target) {
        this._activate(target)
      }
      return
    }

    if (this._activeTarget && scrollTop < this._offsets[0] && this._offsets[0] > 0) {
      this._activeTarget = null
      this._clear()
      return
    }

    const offsetLength = this._offsets.length
    for (let i = offsetLength; i--;) {
      const isActiveTarget = this._activeTarget !== this._targets[i] &&
          scrollTop >= this._offsets[i] &&
          (typeof this._offsets[i + 1] === 'undefined' ||
              scrollTop < this._offsets[i + 1])

      if (isActiveTarget) {
        this._activate(this._targets[i])
      }
    }
  }

// set target as active target, is this to highlight the right nav/list item as
// user is scrolling through?
  _activate(target) {
    this._activeTarget = target

    this._clear()

    let queries = this._selector.split(',')
    // eslint-disable-next-line arrow-body-style
    queries = queries.map((selector) => {
      return `${selector}[data-target="${target}"],` +
              `${selector}[href="${target}"]`
    })

    const $link = $([].slice.call(document.querySelectorAll(queries.join(','))))

    if ($link.hasClass(ClassName.DROPDOWN_ITEM)) {
      $link.closest(Selector.DROPDOWN).find(Selector.DROPDOWN_TOGGLE).addClass(ClassName.ACTIVE)
      $link.addClass(ClassName.ACTIVE)
    } else {
      // Set triggered link as active
      $link.addClass(ClassName.ACTIVE)
      // Set triggered links parents as active
      // With both <ul> and <nav> markup a parent is the previous sibling of any nav ancestor
      $link.parents(Selector.NAV_LIST_GROUP).prev(`${Selector.NAV_LINKS}, ${Selector.LIST_ITEMS}`).addClass(ClassName.ACTIVE)
      // Handle special case when .nav-link is inside .nav-item
      $link.parents(Selector.NAV_LIST_GROUP).prev(Selector.NAV_ITEMS).children(Selector.NAV_LINKS).addClass(ClassName.ACTIVE)
    }

    $(this._scrollElement).trigger(Event.ACTIVATE, {
      relatedTarget: target
    })
  }

// define clear method, clear the active selector and remove class name
  _clear() {
    const nodes = [].slice.call(document.querySelectorAll(this._selector))
    $(nodes).filter(Selector.ACTIVE).removeClass(ClassName.ACTIVE)
  }

  // Static

// not quite sure what this is doing?
  static _jQueryInterface(config) {
    return this.each(function () {
      let data = $(this).data(DATA_KEY)
      const _config = typeof config === 'object' && config

// if no data, define new data
      if (!data) {
        data = new ScrollSpy(this, _config)
        $(this).data(DATA_KEY, data)
      }

// define error if config type is a string and value is undefined
      if (typeof config === 'string') {
        if (typeof data[config] === 'undefined') {
          throw new TypeError(`No method named "${config}"`)
        }
        data[config]()
      }
    })
  }
}

/**
 * ------------------------------------------------------------------------
 * Data Api implementation
 * ------------------------------------------------------------------------
 */

// API implementation, how does this work?
$(window).on(Event.LOAD_DATA_API, () => {
  const scrollSpys = [].slice.call(document.querySelectorAll(Selector.DATA_SPY))

  const scrollSpysLength = scrollSpys.length
  for (let i = scrollSpysLength; i--;) {
    const $spy = $(scrollSpys[i])
    ScrollSpy._jQueryInterface.call($spy, $spy.data())
  }
})

/**
 * ------------------------------------------------------------------------
 * jQuery
 * ------------------------------------------------------------------------
 */

// what does this do?
$.fn[NAME] = ScrollSpy._jQueryInterface
$.fn[NAME].Constructor = ScrollSpy
$.fn[NAME].noConflict = () => {
  $.fn[NAME] = JQUERY_NO_CONFLICT
  return ScrollSpy._jQueryInterface
}

export default ScrollSpy
