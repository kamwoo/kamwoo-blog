import { HTMLProps, useEffect, useState } from 'react';
import { OGBox } from './og-box';

export const MDXOg = async (props: HTMLProps<HTMLAnchorElement>) => {
  const link = props.href?.startsWith('http') ? props.href : '';

  if (!link) {
    return <a {...props} />;
  }

  try {
    const response = await fetch(link);
    const data = await response.text();

    return <OGBox data={data} />;
  } catch (error) {
    return <a {...props} />;
  }
};
