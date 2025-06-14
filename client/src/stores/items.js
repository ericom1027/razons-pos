import { defineStore } from 'pinia'
import api from '../utils/api'
import { notifySuccess, notifyError } from '../utils/notify'

export const useItemsStore = defineStore('items', {
  state: () => ({
    items: [],
    loading: false,
    error: null,
  }),

  actions: {
    async fetchItems() {
      this.loading = true
      try {
        const response = await api.get('/api/get')
        this.items = response.data.items || []
      } catch (error) {
        this.error = error
        notifyError('Failed to fetch items.')
      } finally {
        this.loading = false
      }
    },

    async addItem(formData) {
      try {
        const response = await api.post('/api/add-item', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
        this.items.push(response.data)
        notifySuccess('Item added successfully!')
      } catch (error) {
        console.error('Add Item Failed:', error)

        const message = error.response?.data?.error || 'Failed to add item.'
        notifyError(message)

        throw error
      }
    },

    async editItem(id, formData) {
      try {
        const response = await api.put(`/api/items/${id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })

        const updated = response.data.updatedItem
        const index = this.items.findIndex((i) => i._id === id)
        if (index !== -1) {
          this.items[index] = {
            ...updated,
            lowStock: updated.stock <= 5,
          }
        }

        notifySuccess('Item updated successfully!')
      } catch (error) {
        console.error('Edit Item Failed:', error)
        const message = error.response?.data?.error || 'Failed to update item.'
        notifyError(message)
      }
    },

    async deleteItem(id) {
      try {
        await api.delete(`/api/${id}`)
        this.items = this.items.filter((i) => i._id !== id)
        notifySuccess('Item deleted successfully!')
      } catch (error) {
        console.error('Delete Item Failed:', error)
        notifyError('Failed to delete item.')
      }
    },
  },
})
