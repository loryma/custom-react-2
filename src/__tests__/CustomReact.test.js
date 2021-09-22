/**
 * @jest-environment jsdom
 */

import './requestIdleCallback.mock';
import CustomReact from '../CustomReact';

describe('ReactElement', () => {
  let ComponentFunction;

  beforeEach(() => {
    jest.resetModules();

    ComponentFunction = function() {
      return CustomReact.createElement('div');
    };
  });


  it('returns an element with type and props', () => {
    const element = CustomReact.createElement(ComponentFunction);
    expect(element.type).toBe(ComponentFunction);
    expect(element.props).toEqual({ children: []});
  });

  it('allows a string to be passed as the type', () => {
    const element = CustomReact.createElement('div');
    expect(element.type).toBe('div');
    expect(element.props).toEqual({ children: [] });
  });

});