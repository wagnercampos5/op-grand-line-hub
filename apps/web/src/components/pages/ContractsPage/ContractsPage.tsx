import { useCallback, useEffect, useId, useState } from 'react'
import { Button } from '../../atoms/Button'
import { Label } from '../../atoms/Label'
import { Select, type SelectOption } from '../../atoms/Select'
import { SearchBar } from '../../molecules/SearchBar'
import { ContractCard } from '../../organisms/ContractCard'
import {
  ContractComposer,
  type ContractDraftValues,
} from '../../organisms/ContractComposer'
import { MainFeedLayout } from '../../templates/MainFeedLayout'
import { useAuth } from '../../../contexts/AuthContext'
import { getApiErrorMessage } from '../../../services/api'
import {
  createContractRequest,
  listContractsRequest,
  updateContractStatusRequest,
} from '../../../services/contracts.service'
import type {
  Contract,
  ContractStatus,
  ContractType,
  PaginationMeta,
  Sea,
} from '../../../types/domain'
import {
  CONTRACT_STATUS_LABELS,
  CONTRACT_TYPE_LABELS,
  SEA_LABELS,
} from '../../../utils/formatters'

const SEA_FILTER_OPTIONS: readonly SelectOption[] = [
  { value: '', label: 'Todos os Mares' },
  { value: 'EAST_BLUE', label: SEA_LABELS.EAST_BLUE },
  { value: 'GRAND_LINE', label: SEA_LABELS.GRAND_LINE },
  { value: 'NEW_WORLD', label: SEA_LABELS.NEW_WORLD },
] as const

const TYPE_FILTER_OPTIONS: readonly SelectOption[] = [
  { value: '', label: 'Todas as Modalidades' },
  { value: 'CREW_RECRUITMENT', label: CONTRACT_TYPE_LABELS.CREW_RECRUITMENT },
  { value: 'BOUNTY_HUNTER', label: CONTRACT_TYPE_LABELS.BOUNTY_HUNTER },
] as const

const STATUS_FILTER_OPTIONS: readonly SelectOption[] = [
  { value: '', label: 'Todos os Status' },
  { value: 'OPEN', label: CONTRACT_STATUS_LABELS.OPEN },
  { value: 'IN_PROGRESS', label: CONTRACT_STATUS_LABELS.IN_PROGRESS },
  { value: 'COMPLETED', label: CONTRACT_STATUS_LABELS.COMPLETED },
] as const

export function ContractsPage() {
  const { user, isAuthenticated, logout } = useAuth()
  const seaSelectId = useId()
  const typeSelectId = useId()
  const statusSelectId = useId()

  const [contracts, setContracts] = useState<Contract[]>([])
  const [meta, setMeta] = useState<PaginationMeta>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  })
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [sea, setSea] = useState<Sea | ''>('')
  const [type, setType] = useState<ContractType | ''>('')
  const [status, setStatus] = useState<ContractStatus | ''>('')

  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [composerError, setComposerError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [updatingContractId, setUpdatingContractId] = useState<string | null>(
    null,
  )

  useEffect(() => {
    let active = true

    listContractsRequest({
      page,
      limit: 10,
      search,
      sea,
      type,
      status,
    })
      .then((response) => {
        if (!active) return
        setContracts(response.data)
        setMeta(response.meta)
        setErrorMessage(null)
      })
      .catch((error: unknown) => {
        if (!active) return
        setErrorMessage(
          getApiErrorMessage(
            error,
            'Não foi possível carregar o Mural de Contratos.',
          ),
        )
      })
      .finally(() => {
        if (active) {
          setIsLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [page, search, sea, type, status])

  const reloadContracts = useCallback(
    async (targetPage = page) => {
      setIsLoading(true)
      setErrorMessage(null)
      setActionError(null)
      try {
        const response = await listContractsRequest({
          page: targetPage,
          limit: 10,
          search,
          sea,
          type,
          status,
        })
        setContracts(response.data)
        setMeta(response.meta)
      } catch (error) {
        setErrorMessage(
          getApiErrorMessage(
            error,
            'Não foi possível carregar o Mural de Contratos.',
          ),
        )
      } finally {
        setIsLoading(false)
      }
    },
    [page, search, sea, type, status],
  )

  async function handleCreateContract(values: ContractDraftValues) {
    setComposerError(null)
    setActionError(null)
    setIsCreating(true)
    try {
      await createContractRequest(values)
      setPage(1)
      await reloadContracts(1)
    } catch (error) {
      const message = getApiErrorMessage(
        error,
        'Falha ao publicar o contrato. Tente novamente.',
      )
      setComposerError(message)
      throw error
    } finally {
      setIsCreating(false)
    }
  }

  async function handleUpdateStatus(
    contractId: string,
    nextStatus: ContractStatus,
  ) {
    setActionError(null)
    setUpdatingContractId(contractId)
    try {
      const updated = await updateContractStatusRequest(contractId, nextStatus)
      setContracts((current) =>
        current.map((item) => (item.id === contractId ? updated : item)),
      )
    } catch (error) {
      setActionError(
        getApiErrorMessage(
          error,
          'Não foi possível atualizar o status do contrato. Tente novamente.',
        ),
      )
    } finally {
      setUpdatingContractId(null)
    }
  }

  return (
    <MainFeedLayout
      title="Mural de Contratos & Tripulações"
      subtitle="Publique vagas para sua tripulação ou aceite contratos de caça com recompensas em Berries pelos mares."
      badgeText="Taverna & Editais"
      badgeVariant="gold"
      user={user}
      onLogout={logout}
    >
      <section
        aria-label="Busca e filtros de contratos"
        className="space-y-4 rounded-2xl border border-mist-gray/20 bg-ship-deck/60 p-5"
      >
        <SearchBar
          initialValue={search}
          label="Pesquisar contratos e tripulações"
          placeholder="Buscar por função naval, pirata procurado ou rota..."
          isLoading={isLoading}
          onSearch={(nextTerm) => {
            setActionError(null)
            if (nextTerm !== search || page !== 1) {
              setIsLoading(true)
            }
            setPage(1)
            setSearch(nextTerm)
          }}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor={seaSelectId} className="text-xs">
              Mar de Atuação
            </Label>
            <Select
              id={seaSelectId}
              options={SEA_FILTER_OPTIONS}
              value={sea}
              onChange={(event) => {
                setActionError(null)
                setIsLoading(true)
                setPage(1)
                setSea(event.target.value as Sea | '')
              }}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor={typeSelectId} className="text-xs">
              Tipo de Edital
            </Label>
            <Select
              id={typeSelectId}
              options={TYPE_FILTER_OPTIONS}
              value={type}
              onChange={(event) => {
                setActionError(null)
                setIsLoading(true)
                setPage(1)
                setType(event.target.value as ContractType | '')
              }}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor={statusSelectId} className="text-xs">
              Status do Contrato
            </Label>
            <Select
              id={statusSelectId}
              options={STATUS_FILTER_OPTIONS}
              value={status}
              onChange={(event) => {
                setActionError(null)
                setIsLoading(true)
                setPage(1)
                setStatus(event.target.value as ContractStatus | '')
              }}
            />
          </div>
        </div>
      </section>

      <ContractComposer
        isAuthenticated={isAuthenticated}
        isSubmitting={isCreating}
        errorMessage={composerError}
        onSubmit={handleCreateContract}
      />

      {errorMessage && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-crimson-bounty/40 bg-crimson-bounty/15 p-4 text-sm text-crimson-bounty"
        >
          <span>{errorMessage}</span>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => void reloadContracts()}
          >
            Tentar Novamente
          </Button>
        </div>
      )}

      {actionError && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-crimson-bounty/40 bg-crimson-bounty/15 p-4 text-sm text-crimson-bounty"
        >
          <span>{actionError}</span>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setActionError(null)}
          >
            Dispensar
          </Button>
        </div>
      )}

      {isLoading ? (
        <div
          role="status"
          className="rounded-2xl border border-mist-gray/15 bg-ship-deck/50 p-10 text-center text-sm text-mist-gray"
        >
          Consultando editais afixados na taverna...
        </div>
      ) : contracts.length === 0 ? (
        <div className="rounded-2xl border border-mist-gray/20 bg-ship-deck/50 p-10 text-center">
          <h2 className="text-lg font-bold text-parchment">
            Nenhum contrato encontrado para estes filtros
          </h2>
          <p className="mt-1 text-sm text-mist-gray">
            Altere o mar selecionado, a modalidade ou os termos da busca.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {contracts.map((contract) => (
            <ContractCard
              key={contract.id}
              contract={contract}
              currentUserId={user?.id}
              isUpdatingStatus={updatingContractId === contract.id}
              onUpdateStatus={handleUpdateStatus}
            />
          ))}
        </div>
      )}

      {!isLoading && meta.totalPages > 1 && (
        <nav
          aria-label="Paginação de contratos"
          className="flex items-center justify-between rounded-xl border border-mist-gray/20 bg-ship-deck/60 px-5 py-3"
        >
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={!meta.hasPreviousPage}
            onClick={() => {
              setActionError(null)
              setIsLoading(true)
              setPage((prev) => Math.max(1, prev - 1))
            }}
          >
            Anterior
          </Button>
          <span className="font-mono text-xs text-mist-gray">
            Página {meta.page} de {meta.totalPages}
          </span>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={!meta.hasNextPage}
            onClick={() => {
              setActionError(null)
              setIsLoading(true)
              setPage((prev) => prev + 1)
            }}
          >
            Próxima
          </Button>
        </nav>
      )}
    </MainFeedLayout>
  )
}
