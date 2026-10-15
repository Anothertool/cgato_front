import { Document, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer'
import logo from '../../img/logo/logo-transparent.png'

const columns = [
    { key: 'name', label: 'Nombre y apellidos', width: '28%' },
    { key: 'eye', label: 'Ojo', width: '11%' },
    { key: 'lens', label: 'Lente', width: '25%' },
    { key: 'phone', label: 'Teléfono', width: '13%' },
    { key: 'time', label: 'Hora', width: '7%' },
    { key: 'insurer', label: 'Seguro', width: '16%' },
]
const styles = StyleSheet.create({
    page: {
        paddingTop: 154,
        paddingBottom: 36,
        paddingHorizontal: 30,
        fontFamily: 'Helvetica',
        fontSize: 10,
        color: '#172536',
    },
    header: { position: 'absolute', top: 28, left: 30, right: 30 },
    heading: { flexDirection: 'row', alignItems: 'center', minHeight: 80, marginBottom: 14 },
    logo: { width: 164, height: 80, objectFit: 'contain', marginRight: 18 },
    brand: { fontSize: 15, fontFamily: 'Helvetica-Bold', marginBottom: 7 },
    title: { fontSize: 12, fontFamily: 'Helvetica-Bold' },
    row: { flexDirection: 'row', borderBottomWidth: 0.5, borderColor: '#CBD5E0', minHeight: 36 },
    tableHeader: { backgroundColor: '#EDF2F7', minHeight: 28, fontFamily: 'Helvetica-Bold' },
    cell: { paddingHorizontal: 6, paddingVertical: 10, lineHeight: 1.35, flexShrink: 0 },
    headerCell: { paddingVertical: 7, fontSize: 9 },
    footer: {
        position: 'absolute',
        bottom: 18,
        left: 30,
        right: 30,
        textAlign: 'right',
        fontSize: 8,
        color: '#718096',
    },
})

export default function SurgeryDayReport({ date, rows }) {
    return (
        <Document title={`Listado de cirugías — ${date}`} author="Visión Global" language="es-ES">
            <Page size="A4" orientation="landscape" style={styles.page} wrap>
                <View fixed style={styles.header}>
                    <View style={styles.heading}>
                        <Image src={logo} style={styles.logo} />
                        <View>
                            <Text style={styles.brand}>VISIÓN GLOBAL</Text>
                            <Text style={styles.title}>LISTADO DE CIRUGÍAS — {date}</Text>
                        </View>
                    </View>
                    <View style={[styles.row, styles.tableHeader]}>
                        {columns.map(({ key, label, width }) => (
                            <Text key={key} style={[styles.cell, styles.headerCell, { width }]}>
                                {label}
                            </Text>
                        ))}
                    </View>
                </View>
                {rows.map((row, index) => (
                    <View
                        key={row.id}
                        wrap={false}
                        style={[styles.row, { backgroundColor: index % 2 ? '#F7FAFC' : '#FFFFFF' }]}
                    >
                        {columns.map(({ key, width }) => (
                            <Text key={key} style={[styles.cell, { width }]}>
                                {row[key]}
                            </Text>
                        ))}
                    </View>
                ))}
                <Text
                    fixed
                    style={styles.footer}
                    render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
                />
            </Page>
        </Document>
    )
}
