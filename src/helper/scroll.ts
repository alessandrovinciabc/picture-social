let handleScroll = (
  e: React.UIEvent<HTMLDivElement, UIEvent>,
  condition: boolean,
  callback: Function
) => {
  if (!condition) return;

  let container = e.target as HTMLDivElement;
  let sensitivity = 2; //px

  //height of the viewable element
  //               +
  //distance from top to topmost viewable content
  let sum = container.offsetHeight + container.scrollTop;

  //scrollHeight is the total height of the element
  if (sum >= container.scrollHeight - sensitivity) {
    callback();
  }
};

export default handleScroll;
