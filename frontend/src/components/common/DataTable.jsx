/*

Nom du fichier   : DataTable.jsx
Objectif         : Tableau de donnees generique et reutilisable, base sur MUI DataGrid, utilise par toutes les pages de liste du projet (Equipements, Pannes, Utilisateurs, Mouvements, etc.)
Propriétaire     : Josué BEDEL
Date de création : 29/08/2026

*/

import { DataGrid } from '@mui/x-data-grid'
import { Paper } from '@mui/material'

export default function DataTable({
    rows,
    columns,
    loading = false,
    pageSize = 10,
    getRowId = (row) => row.id,
    onRowClick,
}) {
    return (
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
            <DataGrid
                rows={rows}
                columns={columns}
                loading={loading}
                getRowId={getRowId}
                onRowClick={onRowClick}
                initialState={{
                    pagination: {
                        paginationModel: { pageSize, page: 0 },
                    },
                }}
                pageSizeOptions={[10, 20, 50]}
                disableRowSelectionOnClick
                autoHeight
                sx={{
                    border: 'none',
                    '& .MuiDataGrid-columnHeaders': {
                        backgroundColor: 'info.main',
                        color: 'common.white',
                    },
                    '& .MuiDataGrid-row:hover': {
                        cursor: onRowClick ? 'pointer' : 'default',
                    },
                }}
            />
        </Paper>
    )
}