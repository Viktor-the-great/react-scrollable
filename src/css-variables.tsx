import { type ReactNode } from 'react';
import './css-variables.css';

type CssVariablesPropsType = {
  children: ReactNode;
}

function CssVariables({
  children
}: CssVariablesPropsType) {
  return children;
}

export default CssVariables;