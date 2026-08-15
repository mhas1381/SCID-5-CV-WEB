import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export type DataSourceMode = 'real' | 'test' | 'all'

const STORAGE_KEY = 'scid5.dataSource'

function readStored(): DataSourceMode {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === 'test' || raw === 'all' || raw === 'real') return raw
  } catch {
    // ignore storage errors
  }
  return 'real'
}

interface DataSourceState {
  mode: DataSourceMode
}

const initialState: DataSourceState = {
  mode: readStored(),
}

const dataSourceSlice = createSlice({
  name: 'dataSource',
  initialState,
  reducers: {
    setDataSource(state, action: PayloadAction<DataSourceMode>) {
      state.mode = action.payload
      try {
        localStorage.setItem(STORAGE_KEY, action.payload)
      } catch {
        // ignore storage errors
      }
    },
  },
})

export const { setDataSource } = dataSourceSlice.actions
export const selectDataSource = (state: { dataSource: DataSourceState }) =>
  state.dataSource.mode
export default dataSourceSlice.reducer