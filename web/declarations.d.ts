declare module '*.svg' {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  import React = require('react');
  const content: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  export default content;
  export const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
}

declare module '*.scss' {
  const content: { [className: string]: string };
  export default content;
}
