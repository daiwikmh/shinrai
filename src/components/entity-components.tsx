import { Button } from "@/components/ui/button";
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon, SearchIcon } from "lucide-react";
import Link from "next/link";
import { Input } from "./ui/input";

type EntityHeaderProps = {
  title?: string;
  description?: string;
  newButtonLabel?: string;
  disabled?: boolean;
  isCreating?: boolean;
} & (
  | { onNew: () => void; newButtonHref?: never }
  | { newButtonHref: string; onNew?: never }
  | { onNew?: never; newButtonHref?: never }
);

export const EntityHeader = ({
  title,
  description,
  onNew,
  newButtonHref,
  newButtonLabel,
  disabled,
  isCreating,
}: EntityHeaderProps) => {
  return (
    <div className="flex items-center justify-between gap-x-4">
      <div className="flex flex-col">
        {title && <h1 className="text-lg md:text-xl font-semibold">{title}</h1>}
        {description && (
          <p className="text-xs md:text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {onNew && !newButtonHref && (
        <Button disabled={isCreating || disabled} size="sm" onClick={onNew}>
          <PlusIcon className="size-4"/>{newButtonLabel}
        </Button>
      )}
      {newButtonHref && !onNew && (
        <Button size="sm" asChild>
          <Link href={newButtonHref} prefetch>
            <PlusIcon className="size-4"/>
              {newButtonLabel}
          </Link>
        </Button>
      )}
    </div>
  );
};

type EntityContainerProps = {
  header?: React.ReactNode;
  search?: React.ReactNode;
  pagination?: React.ReactNode;
  children: React.ReactNode;
};

export const EntityContainer = ({
  header,
  search,
  pagination,
  children,
}: EntityContainerProps) => {
  return (
    <div className="p-4 md:px-10 md:py-6 h-full">
      <div className="mx-auto max-w-7xl w-full flex flex-col gap-y-8 h-full">
        {header}
      <div className="flex flex-col gap-y-4 h-full">
        {search}
        {children}
      </div>
      {pagination}
    </div>
    </div>
  );
};

interface EntitySearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const EntitySearch = ({
  value,
  onChange,
  placeholder,
}: EntitySearchProps) => {
  return (
    <div className="flex items-center gap-x-2 self-end">
      <SearchIcon className="size-3.5 relative left-8 text-muted-foreground"/>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="max-w-[200px] bg-background shadow-none border-border pl-8"
      />
    </div>
  );
};

interface EntityPaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}

export const EntityPagination = ({
  page,
  totalPages,
  onPageChange,
  disabled,
}: EntityPaginationProps) => {


  return (
    <div className="flex items-center justify-between gap-x-2">
      <div className="flex-1 text-sm text-muted-foreground">
        Page {page} of {totalPages || 1}
      </div>
      <Button disabled={disabled || page === 1} onClick={() => onPageChange(Math.max(1, page - 1))} variant={"outline"} size={"sm"}>
        <ChevronLeftIcon className="size-4"/>
      </Button>
      <Button disabled={disabled || page === totalPages || totalPages === 0} onClick={() => onPageChange(Math.min(totalPages, page + 1))} variant={"outline"} size={"sm"}>
        <ChevronRightIcon className="size-4"/>
      </Button>
    </div>
  );
};
