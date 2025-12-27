"use client";

import {
  EmptyView,
  EntityContainer,
  EntityHeader,
  EntityItem,
  EntityList,
  EntityPagination,
  EntitySearch,
  ErrorView,
  LoadingView,
} from "@/components/entity-components";
import {
  useRemoveCredential,
  useSuspenseCredentials,
} from "../hooks/use-credentials";
import { useRouter } from "next/navigation";
import { useCredentialsParams } from "../hooks/use-credentials-params";
import { useEntitySearch } from "@/hooks/use-entity-search";
import { CredentialType } from "@/generated/prisma/enums";
import { Credential } from "@/generated/prisma/client";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import Image from "next/image";

export const CredentialsSearch = () => {
  const [params, setParams] = useCredentialsParams();
  const { searchValue, onSearchChange } = useEntitySearch({
    params,
    setParams,
  });

  return (
    <EntitySearch
      value={searchValue}
      onChange={onSearchChange}
      placeholder="Search credentials"
    />
  );
};

export const CredentialsPagination = () => {
  const credentials = useSuspenseCredentials();
  const [params, setParams] = useCredentialsParams();

  return (
    <EntityPagination
      page={credentials?.data?.page}
      totalPages={credentials.data?.totalPages}
      onPageChange={(page) => setParams({ ...params, page })}
      disabled={credentials.isFetching}
    />
  );
};

export const CredentialsList = () => {
  const credentials = useSuspenseCredentials();
  return (
    <EntityList
      items={credentials.data?.items}
      getKey={(credential) => credential.id}
      renderItem={(credential) => (
        <CredentialItem key={credential.id} data={credential} />
      )}
      emptyView={<CredentialsEmpty />}
    />
  );
};

export const CredentialsHeader = ({ disabled }: { disabled: boolean }) => {
  return (
    <EntityHeader
      title="Credentials"
      description="Create and manage your credentials"
      newButtonHref="/credentials/new"
      newButtonLabel="New credential"
      disabled={disabled}
    />
  );
};

export const CredentialsContainer = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <EntityContainer
      header={<CredentialsHeader disabled={false} />}
      search={<CredentialsSearch />}
      pagination={<CredentialsPagination />}
    >
      {children}
    </EntityContainer>
  );
};

export const CredentialsLoading = () => {
  return <LoadingView message="Loading credentials..." />;
};

export const CredentialsError = () => {
  return <ErrorView message="Error Loading credentials" />;
};
export const CredentialsEmpty = () => {
  const router = useRouter();
  return (
    <>
      <EmptyView
        onNew={() => router.push("/credentials/new")}
        message="You haven't created any credentials yet. Create one now."
      />
    </>
  );
};

const credentialLogos: Record<CredentialType, string> = {
  [CredentialType.OPENAI]: "/logo/openai.png",
  [CredentialType.ANTHROPIC]: "/logo/anthropic.png",
  [CredentialType.GEMINI]: "/logo/google.png",
  [CredentialType.OPENROUTER]: "/logo/openrouter.png",
};

export const CredentialItem = ({ data }: { data: Credential }) => {
  const removeCredential = useRemoveCredential();

  const handleRemove = () => {
    removeCredential.mutate(
      { id: data.id },
      {
        onError: (error) => {
          toast.error(error.message);
        },
      },
    );
  };
  const logo = credentialLogos[data.type];

  return (
    <EntityItem
      href={`/credentials/${data.id}`}
      title={data.name}
      subtitle={
        <>
          Updated {formatDistanceToNow(data.updatedAt, { addSuffix: true })}{" "}
          &bull; Created{" "}
          {formatDistanceToNow(data.createdAt, { addSuffix: true })}{" "}
        </>
      }
      image={
        <div className="size-8 flex items-center justify-center">
          <Image src={logo} alt={data.type} width={20} height={20} />
        </div>
      }
      onRemove={handleRemove}
      isRemoving={removeCredential.isPending}
    />
  );
};
