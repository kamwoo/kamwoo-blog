'use client';

import { useCallback, useEffect, useState } from 'react';
import { useHash } from './use-hash';

interface UsePaginationParams<T> {
  contents: T[];
  presentContentCount?: number;
  ellipsisRange?: number;
  onChangePage?: (current: number) => void;
}

export interface CustomPaginationProps {
  presentNumbers: (number | 'ellipsis')[];
  currentPage: number;
  nextPageNumber: number;
  prevPageNumber: number;
}

export const usePagination = <T>(params: UsePaginationParams<T>) => {
  const {
    contents,
    presentContentCount = 4,
    ellipsisRange: presentRange = 3,
    onChangePage,
  } = params;
  const { value: hash } = useHash();
  const pageNumber = Number(hash) || 1;
  const maxPage = Math.ceil(contents.length / presentContentCount);
  const ellipsisRange = presentRange > maxPage ? maxPage : presentRange;

  const getNext = useCallback(() => {
    if (pageNumber + presentContentCount > maxPage) {
      return maxPage;
    }

    return pageNumber + presentContentCount;
  }, []);

  const getPrev = useCallback(() => {
    if (pageNumber - presentContentCount <= 0) {
      return 1;
    }

    return pageNumber - presentContentCount;
  }, []);

  const getContents = () => {
    const start = (pageNumber - 1) * presentContentCount;
    const end = start + presentContentCount;

    return contents.slice(start, end);
  };

  const getPresentNumbers = () => {
    const numbers: CustomPaginationProps['presentNumbers'] = [];
    const boundary = Math.ceil(ellipsisRange / 2);

    if (maxPage <= ellipsisRange) {
      Array.from({ length: ellipsisRange }).forEach((_, index) => {
        numbers.push(index + 1);
      });

      return numbers;
    }

    if (pageNumber <= boundary) {
      Array.from({ length: ellipsisRange }).forEach((_, index) => {
        numbers.push(index + 1);
      });
      numbers.push('ellipsis');

      return numbers;
    }

    if (pageNumber >= maxPage - boundary) {
      Array.from({ length: ellipsisRange }).forEach((_, index) => {
        numbers.push(maxPage - index);
      });
      numbers.push('ellipsis');

      return numbers.reverse();
    }

    numbers.push('ellipsis');
    Array.from({ length: ellipsisRange }).forEach((_, index) => {
      numbers.push(pageNumber - boundary + index);
    });
    numbers.push('ellipsis');
    return numbers;
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [hash]);

  const register = (): CustomPaginationProps => {
    return {
      presentNumbers: getPresentNumbers(),
      currentPage: pageNumber,
      nextPageNumber: getNext(),
      prevPageNumber: getPrev(),
    };
  };

  useEffect(() => {
    if (onChangePage) onChangePage(pageNumber);
  }, [pageNumber, onChangePage]);

  return { register, currentPage: pageNumber, contents: getContents() };
};
