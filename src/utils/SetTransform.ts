import { Direction, DragMouseTouchEvent } from "index";
import {
  draggableIsOutside,
  getBorderWidthProperty,
  getMarginStyleByProperty,
  getPropByDirection,
} from "./GetStyles";
import { Ref, ref } from "vue";
export const useTransform = () => {
  const currentOffset = ref({ offsetX: 0, offsetY: 0 });
  // TOOD: create position state
  function setTransform(
    element: HTMLElement,
    parent: HTMLElement,
    pagePosition: Ref<{
      pageX: number;
      pageY: number;
    }>,
    translate: Ref<{
      x: number;
      y: number;
    }>,
    position: Ref<{
      top: number;
      left: number;
    }>,
    direction?: Direction
  ) {
    const elementBoundingClientRect = element.getBoundingClientRect();

    const getTranslateWihtDirection = (translateDirection: Direction) => {
      const {
        beforeMargin,
        borderBeforeWidth,
        before,
        offset,
        scroll,
        page,
        inner,
        distance,
        axis,
      } = getPropByDirection(translateDirection);
      const pageValue = pagePosition.value[page];
      const scrollValue = window[scroll];
      const innerDistance = window[inner];
      const distanceValue = elementBoundingClientRect[distance];
      const border = getBorderWidthProperty(element, borderBeforeWidth);
      const margin = getMarginStyleByProperty(element, beforeMargin);
      const elementPosittion = pageValue - currentOffset.value[offset];
      if (
        elementPosittion >= scrollValue - distanceValue / 2 &&
        elementPosittion <= scrollValue + innerDistance
      ) {
        const newTranslate =
          elementPosittion -
          position.value[before] -
          border -
          margin -
          scrollValue;

        updateScroll(translateDirection);

        return newTranslate;
      }
      const defaultTransalation = translate.value[axis];
      return defaultTransalation;
    };
    const updateScroll = (translateDirection: Direction) => {
      if (
        element &&
        element.classList.contains("dragging") &&
        parent &&
        translateDirection === direction
      ) {
        const { before, distance, axis } = getPropByDirection(direction);
        const elementBoundingClientRect = element.getBoundingClientRect();
        const distanceValue = elementBoundingClientRect[distance];

        const parentBoundingClientRect = parent.getBoundingClientRect();
        const positionInsideParent =
          position.value[before] -
          parentBoundingClientRect[before] +
          translate.value[axis];

        const parentDistance = parentBoundingClientRect[distance];
        const totalDistance = parentDistance - distanceValue;
        const relativePosition = positionInsideParent / totalDistance;
        const relativeDistanceValue = distanceValue / totalDistance;

        const velocity = 0.1;
        const infLimit = 0.25;
        const upperLimit = 0.75;
        let percent = 0;
        const isOutside = draggableIsOutside(element);
        if (
          !isOutside &&
          relativePosition < infLimit &&
          relativePosition > -relativeDistanceValue
        ) {
          percent = relativePosition / infLimit - 1;
        } else if (
          !isOutside &&
          relativePosition > upperLimit &&
          relativePosition < 1 + relativeDistanceValue
        ) {
          percent = (1 / (1 - upperLimit)) * (relativePosition - upperLimit);
        }
        const scrollAmount = velocity * distanceValue * percent;
        scrollByDirection(parent, direction, scrollAmount);
      }
    };
    const scrollByDirection = (
      element: HTMLElement,
      direction: Direction,
      scrollAmount: number
    ) => {
      if (scrollAmount == 0) {
        return;
      }
      if (direction === "vertical") {
        element.scrollBy(0, scrollAmount);
      } else {
        element.scrollBy(scrollAmount, 0);
      }
    };
    const updateTranlateByDirection = (direction: Direction) => {
      const { axis } = getPropByDirection(direction);
      translate.value[axis] = getTranslateWihtDirection(direction);
    };
    updateTranlateByDirection("horizontal");
    updateTranlateByDirection("vertical");
  }
  const updateTransformState = (
    event: DragMouseTouchEvent,
    element: HTMLElement,
    position: Ref<{
      top: number;
      left: number;
    }>
  ) => {
    const { offsetX, offsetY } = event;
    currentOffset.value = { offsetX, offsetY };
    const getPositionByDistance = (direction: Direction) => {
      const { offset, beforeMargin, page, borderBeforeWidth, scroll } =
        getPropByDirection(direction);
      return (
        event[page] -
        currentOffset.value[offset] -
        getMarginStyleByProperty(element, beforeMargin) -
        getBorderWidthProperty(element, borderBeforeWidth) -
        window[scroll]
      );
    };
    position.value = {
      top: getPositionByDistance("vertical"),
      left: getPositionByDistance("horizontal"),
    };
  };
  return {
    setTransform,
    updateTransformState,
  };
};