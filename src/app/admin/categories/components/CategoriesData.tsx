'use client'

import { AdminCard, AdminGrid, EmptyData, IconButton, LoadingData, ModalConfirm } from '@/components'
import { useUiStore } from '@/store/ui-store'
import { Category, Role, Size } from '@/interfaces'
import { deleteCategory, editCategory } from '@/actions/category-actions'
import { useEffect, useState } from 'react'
import { fetchData } from '@/utils'
import { useGlobalStore } from '@/store/global-store'
import { CategoriesDataSkeleton } from './'
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable'
import { AdminSortableCard } from '@/components'
import Image from 'next/image'
import Link from 'next/link'

type Props = {
  token?: string
  role?: string
}

export const CategoriesData = ({ token, role }: Props) => {
  const [ categories, setCategories ] = useState<Category[ ]>([])
  const [ loading, setLoading ] = useState( true )
  const [ activeId, setActiveId ] = useState<string | null>( null )

  const { updateTrigger, toggleUpdateTrigger } = useGlobalStore()
  const { openModalConfirm, activeModalConfirmId, closeModalConfirm } =
    useUiStore()

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  useEffect(() => {
    const fetchCategories = async () => {
      const data: Category[] = await fetchData({ url: `/categories`, token })
      setCategories( data )
      setLoading( false )
    }
    fetchCategories()
  }, [ token, updateTrigger ])

  const handleDeleteCategoryConfirm = async ( id: string ) => {
    await deleteCategory(id, token!)
    closeModalConfirm()
    toggleUpdateTrigger()
  }

  const updateCategoryOrder = async ( categories: Category[], token: string ) => {
    for ( let i = 0; i < categories.length; i++ ) {
      const category = categories[i]
      await editCategory( category.id, { orderNumber: i + 1 }, token )
    }
  }
  
  const handleDragStart = ( event: DragStartEvent ) => {
    setActiveId( event.active.id as string )
  }

  const handleDragEnd = async ( event: DragEndEvent ) => {
    const { active, over } = event
  
    if ( over && active.id !== over.id ) {
      const oldIndex = categories.findIndex(( item ) => item.id === active.id )
      const newIndex = categories.findIndex(( item ) => item.id === over.id )
      if ( oldIndex !== newIndex ) {
        const newCategories = arrayMove( categories, oldIndex, newIndex )
        setCategories( newCategories )

        await updateCategoryOrder( newCategories, token! )
        toggleUpdateTrigger()
      }
    }
  
    setActiveId( null )
  }

  const isOwner = role === Role.OWNER

  return (
    <>
      {loading ? (
        <LoadingData text="Categorías"/>
      ) : categories.length === 0 ? (
        <EmptyData text='Categorías' />
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={categories.map((item) => item.id)}>
            <AdminGrid>
              { categories.map(( category ) => (
                <>
                  <AdminSortableCard
                    key={category.id}
                    id={category.id}
                    category={category}
                    isOwner={isOwner} 
                    onDelete={() => openModalConfirm(category.id)}
                  />                    
                  <ModalConfirm
                    title={`¿Estás seguro de eliminar esta categoría? ${ category.name }`}
                    detail='Al eliminar esta categoría, también se eliminarán todos sus productos asociados.'
                    buttonConfirmText='Sí, eliminar categoría'
                    onClickConfirm={() => {
                      handleDeleteCategoryConfirm(category.id)
                    }}
                    onClickCancel={() => {
                      closeModalConfirm()
                    }}
                    isOpen={activeModalConfirmId === category.id}
                  />
                </>
              ))}
            </AdminGrid>
          </SortableContext>
          <DragOverlay>
            { activeId ? (
              <>
                {(() => {
                  const category = categories.find((item) => item.id === activeId)!
                  return (
                    <>
                    <AdminCard
                      onClickDelete={ () => openModalConfirm( category.id ) }
                      linkEdit={`/admin/categories/edit/${ category.id }`}
                      className="shadow-[0_20px_40px_rgba(0,0,0,0.4)]"
                      hasFooter={isOwner}
                      footer={
                        <>
                          {isOwner && (
                            <div className="flex items-start leading-4 text-xs gap-2">
                              <i className="fi fi-tr-store-alt text-base -mt-[2px]"></i>
                              {category.user.branch.name}
                            </div>
                          )}
                          <div className="flex items-start leading-4 text-xs gap-2">
                            <i className="fi fi-tr-circle-user text-base -mt-[2px]"></i>
                            {category.user.fullName}
                          </div>
                        </>
                      }
                    >
                      <div className="flex items-center justify-center rounded-lg text-lg text-accent h-16 w-16 overflow-hidden bg-gray50">
                        { category.image ? (
                          <Image
                            src={category.image}
                            alt={category.name}
                            width={128}
                            height={128}
                            className="aspect-square object-cover"
                          />
                        ) : (
                          <i className="fi fi-tr-image-slash"></i>
                        )}
                      </div>
                      <h2 className="text-lg font-semibold mt-4">{ category.orderNumber } { category.name }</h2>
                      <p className="text-gray500">
                        {category.products.length} Producto
                        {category.products.length !== 1 && "s"}
                      </p>
                      <div className="cursor-grabbing absolute bottom-2 right-2 h-8 w-8 flex items-center justify-center bg-background text-foreground transition-all rounded-2xl">
                        <i className="fi fi-tr-arrows text-base"></i>
                      </div>
                    </AdminCard>
                    </>
                  )
                })()}
              </>
            ) : null}
          </DragOverlay>

        </DndContext>
      )}
    </>
  )
}
