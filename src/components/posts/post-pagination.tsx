'use client';

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { CustomPaginationProps } from '@/hooks/use-pagination';

export const PostPagination = (props: CustomPaginationProps) => {
  const { presentNumbers, currentPage, nextPageNumber, prevPageNumber } = props;

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href={`#${prevPageNumber}`} />
        </PaginationItem>

        {presentNumbers?.map((value, index) => (
          <PaginationItem key={index}>
            {value === 'ellipsis' ? (
              <PaginationEllipsis />
            ) : (
              <PaginationLink href={`#${value}`} isActive={currentPage === value}>
                {value}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}

        <PaginationItem>
          <PaginationNext href={`#${nextPageNumber}`} />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};
