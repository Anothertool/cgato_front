import { Document, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer'
import logo from '../../img/logo/logo-pdf.png'
import { formatDate, iolModelLabels, patientName, surgeryTypeLabels } from '../../utils/format'
import { formatMoney } from '../cash/utils'

const styles = StyleSheet.create({
    page: { padding: 32, fontFamily: 'Helvetica', fontSize: 9, color: '#102B4C', lineHeight: 1.4 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
    logo: { width: 150, height: 74, objectFit: 'contain' },
    brand: { fontFamily: 'Helvetica-Bold', fontSize: 14, letterSpacing: 1 },
    subtitle: { color: '#59718A', fontSize: 10, letterSpacing: 2 },
    titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    title: { fontFamily: 'Helvetica-Bold', fontSize: 25, letterSpacing: 1, lineHeight: 1.2, marginBottom: 6 },
    dateBox: { backgroundColor: '#EDF3F8', padding: 12, borderRadius: 5, width: 190 },
    section: { borderWidth: 0.7, borderColor: '#CBD9E6', borderRadius: 4, marginBottom: 14 },
    sectionTitle: {
        backgroundColor: '#EAF1F7',
        padding: 8,
        fontFamily: 'Helvetica-Bold',
        letterSpacing: 1.5,
        fontSize: 9,
    },
    content: { padding: 10 },
    infoRow: { flexDirection: 'row', marginBottom: 5 },
    infoLabel: { width: 120, color: '#59718A' },
    infoValue: { flex: 1, fontFamily: 'Helvetica-Bold' },
    row: { flexDirection: 'row', borderBottomWidth: 0.6, borderColor: '#D6E0E9' },
    tableHead: { backgroundColor: '#F2F6FA', fontFamily: 'Helvetica-Bold', fontSize: 8, letterSpacing: 0.7 },
    concept: { width: '25%', padding: 7, fontFamily: 'Helvetica-Bold' },
    detail: { width: '49%', padding: 7 },
    amount: { width: '26%', padding: 7, textAlign: 'right', fontFamily: 'Helvetica-Bold' },
    total: { flexDirection: 'row', backgroundColor: '#EAF1F7', alignItems: 'center', padding: 12 },
    totalLabel: { flex: 1, fontFamily: 'Helvetica-Bold', fontSize: 11, letterSpacing: 1 },
    totalAmount: { fontFamily: 'Helvetica-Bold', fontSize: 18 },
    paragraph: { marginBottom: 5, color: '#37516D' },
    footer: {
        marginTop: 4,
        paddingTop: 12,
        borderTopWidth: 0.7,
        borderColor: '#CBD9E6',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    footerLogo: { width: 140, height: 65, objectFit: 'contain' },
    signature: { width: 225, borderWidth: 0.7, borderColor: '#B6C8D9', borderRadius: 4, padding: 14, paddingTop: 28 },
    signatureText: {
        borderTopWidth: 0.7,
        borderColor: '#59718A',
        paddingTop: 5,
        textAlign: 'center',
        color: '#59718A',
        fontSize: 8,
    },
})

function Section({ title, children }) {
    return (
        <View style={styles.section} wrap={false}>
            <Text style={styles.sectionTitle}>{title}</Text>
            <View style={styles.content}>{children}</View>
        </View>
    )
}

export default function SurgeryQuote({ surgery }) {
    const patient = surgery.patient
    const name = patient ? patientName(patient) : surgery.patient_name || 'Sin nombre'
    const eye = { RIGHT: 'Derecho (OD)', LEFT: 'Izquierdo (OI)', BOTH: 'Ambos ojos' }[surgery.eye] || '—'
    const amount =
        surgery.amount == null || surgery.amount === '' ? 'Pendiente de valorar' : formatMoney(surgery.amount)
    const power =
        surgery.iol_power == null || surgery.iol_power === ''
            ? '—'
            : `${Number(surgery.iol_power).toLocaleString('es-ES')} D`
    return (
        <Document title={`Presupuesto de cirugía - ${name}`} author="Visión Global" language="es-ES">
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    <Image src={logo} style={styles.logo} />
                    <View>
                        <Text style={styles.brand}>VISIÓN GLOBAL</Text>
                        <Text style={styles.subtitle}>OFTALMOLOGÍA AVANZADA</Text>
                    </View>
                </View>
                <View style={styles.titleRow}>
                    <View>
                        <Text style={styles.title}>PRESUPUESTO</Text>
                        <Text style={styles.subtitle}>CIRUGÍA OFTALMOLÓGICA</Text>
                    </View>
                    <View style={styles.dateBox}>
                        <Text>Fecha de emisión: {formatDate(surgery.created_at)}</Text>
                    </View>
                </View>
                <Section title="DATOS DEL PACIENTE">
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Nombre y apellidos:</Text>
                        <Text style={styles.infoValue}>{name}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Teléfono:</Text>
                        <Text style={styles.infoValue}>{patient?.phone || '—'}</Text>
                    </View>
                </Section>
                <Section title="DETALLE DE LA INTERVENCIÓN">
                    <View style={[styles.row, styles.tableHead]}>
                        <Text style={styles.concept}>CONCEPTO</Text>
                        <Text style={styles.detail}>DETALLE</Text>
                        <Text style={styles.amount}>IMPORTE</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.concept}>Intervención</Text>
                        <Text style={styles.detail}>
                            {surgery.surgery_type_label ||
                                surgeryTypeLabels[surgery.surgery_type] ||
                                surgery.surgery_type ||
                                '—'}
                        </Text>
                        <Text style={styles.amount}>{amount}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.concept}>Ojo</Text>
                        <Text style={styles.detail}>{eye}</Text>
                        <Text style={styles.amount}>—</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.concept}>Lente intraocular</Text>
                        <View style={styles.detail}>
                            <Text>
                                Modelo:{' '}
                                {surgery.iol_model_label ||
                                    iolModelLabels[surgery.iol_model] ||
                                    surgery.iol_model ||
                                    '—'}
                            </Text>
                            <Text>Potencia: {power}</Text>
                        </View>
                        <Text style={styles.amount}>—</Text>
                    </View>
                    <View style={styles.total}>
                        <Text style={styles.totalLabel}>TOTAL DEL PRESUPUESTO</Text>
                        <Text style={styles.totalAmount}>{amount}</Text>
                    </View>
                </Section>
                <Section title="INFORMACIÓN DE LA INTERVENCIÓN">
                    <Text style={styles.paragraph}>
                        Intervención y lente intraocular según los datos indicados en este presupuesto.
                    </Text>
                    <Text style={styles.paragraph}>
                        El alcance de los servicios incluidos y cualquier condición particular se confirmarán con la
                        clínica antes de la intervención.
                    </Text>
                </Section>
                <Section title="CONDICIONES GENERALES">
                    <Text style={styles.paragraph}>
                        La planificación de la cirugía está sujeta a la valoración médica y a las pruebas preoperatorias
                        que correspondan.
                    </Text>
                    <Text style={styles.paragraph}>
                        Para confirmar la intervención será necesaria la firma del consentimiento informado.
                    </Text>
                    <Text>Si tiene cualquier duda sobre este presupuesto, consulte con la clínica.</Text>
                </Section>
                <View style={styles.footer} wrap={false}>
                    <Image src={logo} style={styles.footerLogo} />
                    <View style={styles.signature}>
                        <Text style={styles.signatureText}>Firma del paciente</Text>
                    </View>
                </View>
            </Page>
        </Document>
    )
}
