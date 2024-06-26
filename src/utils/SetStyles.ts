import { Direction } from "../composables";
import { DragMouseTouchEvent } from "../../index";
import { getBorderWidthProperty, getPropByDirection } from "./GetStyles";

type onTouchEvent = "ontouchstart" | "ontouchmove" | "ontouchend";
const onMouseEvents = ["onmouseup", "onmousedown", "onmousemove"] as const;
type onMouseEvent = typeof onMouseEvents[number];

type TouchEventType = "touchstart" | "touchmove" | "touchend";
const mouseEvents = ["mouseup", "mousedown", "mousemove"] as const;
type MouseEventType = typeof mouseEvents[number];
export const fixSizeStyle = (element: HTMLElement | undefined | null) => {
  if (!element) {
    return;
  }
  const { height, width } = element.getBoundingClientRect();
  element.style.height = `${height}px`;
  element.style.width = `${width}px`;
};
export const moveTranslate = (
  element: HTMLElement | undefined | null,
  height: number,
  width: number
) => {
  if (!element) {
    return;
  }
  if (width == 0 && height == 0) {
    element.style.transform = ``;
  } else {
    element.style.transform = `translate(${width}px,${height}px)`;
  }
};

export const assignDraggingEvent = (
  element: HTMLElement,
  onEvent: onMouseEvent | onTouchEvent,
  callback: ((event: DragMouseTouchEvent) => void) | null
) => {
  if (!callback) {
    return;
  }
  if (isOnMouseEvent(onEvent)) {
    element[onEvent] = callback;
  } else {
    element[onEvent] = (event: TouchEvent) => {
      const dragMouseTouchEvent = convetEventToDragMouseTouchEvent(event);
      callback(dragMouseTouchEvent);
    };
  }
};
export const addDragMouseToucEventListener = (
  event: TouchEventType | MouseEventType,
  callback: ((event: DragMouseTouchEvent) => void) | null
) => {
  if (!callback) {
    return;
  }
  if (isMouseEvent(event)) {
    document.addEventListener(event, callback);
  } else {
    document.addEventListener(event, (event: TouchEvent) => {
      const dragMouseTouchEvent = convetEventToDragMouseTouchEvent(event);
      callback(dragMouseTouchEvent);
    });
  }
};
const isOnMouseEvent = (x: any): x is onMouseEvent => onMouseEvents.includes(x);
const isMouseEvent = (x: any): x is MouseEventType => mouseEvents.includes(x);

export const convetEventToDragMouseTouchEvent = (
  event: MouseEvent | TouchEvent
): DragMouseTouchEvent => {
  const tempEvent = getEvent(event);
  if (!tempEvent) {
    const { target } = event;
    return {
      clientX: 0,
      clientY: 0,
      pageX: 0,
      pageY: 0,
      screenX: 0,
      screenY: 0,
      target,
      offsetX: 0,
      offsetY: 0,
    };
  }
  const { clientX, clientY, pageX, pageY, screenX, screenY, target } =
    tempEvent;
  let offsetX = 0,
    offsetY = 0;

  if (event instanceof MouseEvent) {
    offsetX = event.offsetX;
    offsetY = event.offsetY;
  } else {
    const element = event.target as HTMLElement;
    offsetX = getOffset(tempEvent, window, "horizontal", element);
    offsetY = getOffset(tempEvent, window, "vertical", element);
  }
  return {
    clientX,
    clientY,
    pageX,
    pageY,
    screenX,
    screenY,
    target,
    offsetX,
    offsetY,
  };
};
const getEvent = (event: MouseEvent | TouchEvent) => {
  if (window.TouchEvent && event instanceof TouchEvent) {
    return event.touches[0];
  }
  if (event instanceof MouseEvent) {
    return event;
  }
};
const getOffset = (
  event: MouseEvent | Touch,
  window: Window,
  direction: Direction,
  element: HTMLElement
) => {
  const { page, scroll, before, borderBeforeWidth } =
    getPropByDirection(direction);
  const boundingClientRect = element.getBoundingClientRect();
  return (
    event[page] -
    window[scroll] -
    boundingClientRect[before] -
    getBorderWidthProperty(element, borderBeforeWidth)
  );
};
export const setTranistion = (
  element: HTMLElement | undefined,
  duration: number,
  timingFunction: string = "ease-out",
  types: string = "transform"
) => {
  if (element) {
    element.style.transition = `${duration}ms ${timingFunction}`;
    element.style.transitionProperty = `${types}`;
  }
};
export const setEventWithInterval = (
  element: HTMLElement | undefined,
  eventName: "onscroll",
  callback: () => void
) => {
  if (!element) {
    return;
  }
  element[eventName] = () => {
    callback();
  };
};
const getStyles = (element: HTMLElement) => {
  var style = element.querySelector("style");
  if (!style) {
    var newStyle = document.createElement("style");
    element.appendChild(newStyle);
    return newStyle;
  }
  return style;
};
const containRule = (sheet: CSSStyleSheet, cssCode: string) => {
  const selectorTextRegex = /\.-?[_a-zA-Z0-9-*\s<>():]+/g;
  const [selectorText] = cssCode.match(selectorTextRegex) || [];
  for (const rule of sheet.cssRules) {
    const [ruleSelectorText] = rule.cssText.match(selectorTextRegex) || [];
    if (selectorText === ruleSelectorText) {
      return true;
    }
  }
  return false;
};
export const AddCssStylesToElement = (
  element: HTMLElement,
  cssCodes: string[]
) => {
  cssCodes.forEach((cssCode) => {
    AddCssStyleToElement(element, cssCode);
  });
};

const AddCssStyleToElement = (element: HTMLElement, cssCode: string) => {
  var style = getStyles(element);
  if (!style.sheet) {
    return;
  }
  if (!containRule(style.sheet, cssCode)) {
    style.sheet?.insertRule(cssCode, style.sheet.cssRules.length);
  }
};
