"use client"

import { EntityContainer, EntityHeader, EntityPagination, EntitySearch } from "@/components/entity-components";
import { useCreateWorkflow, useSuspenseWorkflows } from "../hooks/use-workflows";
import { useUpgradeModal } from "@/hooks/use-upgrade-modal";
import { useRouter } from "next/navigation";
import { useWorkflowParams } from "../hooks/use-workflow-params";
import { useEntitySearch } from "@/hooks/use-entity-search";

export const WorkflowsSearch = () => {
  const [params, setParams] = useWorkflowParams()
  const { searchValue, onSearchChange } = useEntitySearch({params, setParams})
  
  return (
    <EntitySearch 
      value={searchValue}
      onChange={onSearchChange}
      placeholder="Search workflows"
    />
  )
}

export const WorkflowPagination = () => {
  const workflows = useSuspenseWorkflows();
  const [ params, setParams ] = useWorkflowParams()
  
  return (
    <EntityPagination
    page={workflows?.data?.page}
    totalPages={workflows.data?.totalPages}
    onPageChange={(page)=> setParams({...params, page})}
    disabled={workflows.isFetching}/>  
  )
}

export const WorkflowList = () => {
  const workflows = useSuspenseWorkflows()

  return (
    <p>
      {JSON.stringify(workflows.data, null, 2)}
    </p>
  );
};

export const WorkflowsHeader = ({disabled} : {disabled: boolean}) => {
  const createWorkflow = useCreateWorkflow()
  const router = useRouter()
  const {handleError, modal} = useUpgradeModal()
  
  const handleCreateWorkflow = () => {
    createWorkflow.mutate(undefined,
      {
        onSuccess: (data) => {
          router.push(`/workflows/${data.id}`)
        },
        onError: (error) => {
          handleError(error)
        }
      }
    )
  }
  
  return (
    <>
      {modal}
      <EntityHeader
        title="Workflows"
        description="Create and manage your workflows"
        onNew={handleCreateWorkflow}
        newButtonLabel="New workflow"
        disabled={disabled}
        isCreating={createWorkflow.isPending}
      />
    </>
  )
}

export const WorkflowsContainer = ({children}: {children: React.ReactNode}) => {
  return (
    <EntityContainer
      header={<WorkflowsHeader disabled={false} />}
      search={<WorkflowsSearch/>}
      pagination={<WorkflowPagination/>}
    >
      {children}
    </EntityContainer>
  )
}