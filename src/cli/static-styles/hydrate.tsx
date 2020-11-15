/**
 * Copyright 2019, SumUp Ltd.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React from 'react';
import { entries, isFunction, kebabCase, trimChars } from 'lodash/fp';

// This file needs to be generated with the `yarn build:docgen` command.
// The TS error is suppressed to pass linting in CI.
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
// eslint-disable-next-line import/extensions
import { docgen } from './docgen';
import { propTypes } from './config';
import {
  ComponentConfig,
  Props,
  PropItem,
  PropTypes,
  Variation,
} from './types';

const element = (props: any) => <div {...props} />;

const trimQuotes = trimChars('" ');

const extendedPropTypes: PropTypes = {
  ...propTypes,
  enum: ({ value }) => value.map((v: { value: string }) => trimQuotes(v.value)),
  ReactNode: [element],
  children: [element],
  onClick: [() => {}],
};

function getVariations(
  propName: string,
  prop: PropItem,
  propOverrides: PropTypes,
): Variation[] | null {
  const propType =
    propOverrides[propName] ||
    extendedPropTypes[prop.type.name] ||
    extendedPropTypes[propName];

  if (propType) {
    return isFunction(propType) ? propType(prop.type) : propType;
  }

  return null;
}

function getProps(props: Props, propOverrides: PropTypes) {
  return entries(props).reduce((acc, [name, prop]) => {
    const propName = trimQuotes(name);
    const variations = getVariations(propName, prop, propOverrides);
    if (!variations) {
      const { name: type } = prop.type;
      console.warn(
        [
          `No variations found for prop "${propName}" of type "${type}"`,
          'Please provide a custom override.',
        ].join(' '),
      );
      return acc;
    }
    return { ...acc, [propName]: variations };
  }, {});
}

export function hydrate(componentConfig: ComponentConfig) {
  try {
    const { name, component, props: propOverrides = {} } = componentConfig;
    const { props } = docgen[name];

    return {
      component,
      name: kebabCase(name),
      props: getProps(props, propOverrides),
    };
  } catch (error) {
    console.error('Failed to extract component info.', componentConfig);
    throw error;
  }
}
