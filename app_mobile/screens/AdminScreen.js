import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  FlatList,
  RefreshControl
} from 'react-native';
import { solicitudService } from '../services/solicitudService';

export default function AdminScreen() {
  const [estadisticas, setEstadisticas] = useState({
    total: 0,
    pendientes: 0,
    aprobadas: 0,
    denegadas: 0
  });
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);
  const [motivoDenegacion, setMotivoDenegacion] = useState('');
  const [mostrarOpcionesDenegacion, setMostrarOpcionesDenegacion] = useState(false);
  const [procesando, setProcesando] = useState(false);

  const cargarDatos = useCallback(async () => {
    try {
      setLoading(true);
      const [estResp, solicResp] = await Promise.all([
        solicitudService.obtenerEstadisticas(),
        solicitudService.obtenerSolicitudes(filtroEstado ? { estado: filtroEstado } : {})
      ]);

      if (estResp.success) {
        setEstadisticas(estResp.estadisticas);
      }
      if (solicResp.success) {
        setSolicitudes(solicResp.data?.data || []);
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  }, [filtroEstado]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const onRefresh = async () => {
    setRefreshing(true);
    await cargarDatos();
    setRefreshing(false);
  };

  const verDetalles = async (solicitud) => {
    try {
      const resp = await solicitudService.obtenerSolicitud(solicitud.id_solicitud);
      if (resp.success) {
        setSolicitudSeleccionada(resp.solicitud);
        setModalVisible(true);
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleAprobar = async () => {
    if (!solicitudSeleccionada) return;

    Alert.alert(
      'Confirmación',
      '¿Aprobar esta solicitud? Se creará un usuario temporal automáticamente.',
      [
        { text: 'Cancelar', onPress: () => {} },
        {
          text: 'Aprobar',
          onPress: async () => {
            setProcesando(true);
            try {
              const resp = await solicitudService.aprobarSolicitud(solicitudSeleccionada.id_solicitud);
              if (resp.success) {
                Alert.alert('Éxito', `Solicitud aprobada.\nUID NFC: ${resp.usuario_temporal.uid_nfc}`);
                cerrarModal();
                await cargarDatos();
              }
            } catch (error) {
              Alert.alert('Error', error.message);
            } finally {
              setProcesando(false);
            }
          }
        }
      ]
    );
  };

  const handleDenegar = async () => {
    if (!motivoDenegacion.trim()) {
      Alert.alert('Error', 'Debes especificar un motivo');
      return;
    }

    Alert.alert(
      'Confirmación',
      '¿Denegar esta solicitud?',
      [
        { text: 'Cancelar', onPress: () => {} },
        {
          text: 'Denegar',
          onPress: async () => {
            setProcesando(true);
            try {
              const resp = await solicitudService.negarSolicitud(
                solicitudSeleccionada.id_solicitud,
                motivoDenegacion
              );
              if (resp.success) {
                Alert.alert('Éxito', 'Solicitud denegada y notificación enviada');
                cerrarModal();
                await cargarDatos();
              }
            } catch (error) {
              Alert.alert('Error', error.message);
            } finally {
              setProcesando(false);
            }
          }
        }
      ]
    );
  };

  const cerrarModal = () => {
    setModalVisible(false);
    setSolicitudSeleccionada(null);
    setMotivoDenegacion('');
    setMostrarOpcionesDenegacion(false);
  };

  const StatCard = ({ label, value, color }) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  const SolicitudItem = ({ item }) => (
    <TouchableOpacity
      style={styles.solicitudItem}
      onPress={() => verDetalles(item)}
    >
      <View style={styles.solicitudHeader}>
        <Text style={styles.solicitudId}>#{item.id_solicitud}</Text>
        <View style={[styles.badge, { backgroundColor: getColorEstado(item.estado) }]}>
          <Text style={styles.badgeText}>{item.estado}</Text>
        </View>
      </View>
      <Text style={styles.solicitudSolicitante}>{item.solicitante}</Text>
      <Text style={styles.solicitudSubtitle}>{item.email}</Text>
      <Text style={styles.solicitudMotivo}>{item.visitante}</Text>
      <Text style={styles.solicitudFecha}>{item.fecha_ingreso}</Text>
    </TouchableOpacity>
  );

  const getColorEstado = (estado) => {
    switch (estado) {
      case 'Pendiente':
        return '#ffc107';
      case 'Aprobada':
        return '#28a745';
      case 'Denegada':
        return '#dc3545';
      default:
        return '#6c757d';
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0056b3" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.header}>
          <Text style={styles.title}>📋 Gestión de Solicitudes</Text>
        </View>

        {/* Estadísticas */}
        <View style={styles.statsGrid}>
          <StatCard label="Pendientes" value={estadisticas.pendientes} color="#ffc107" />
          <StatCard label="Aprobadas" value={estadisticas.aprobadas} color="#28a745" />
          <StatCard label="Denegadas" value={estadisticas.denegadas} color="#dc3545" />
          <StatCard label="Total" value={estadisticas.total} color="#0056b3" />
        </View>

        {/* Filtros */}
        <View style={styles.filtrosContainer}>
          <Text style={styles.filtroLabel}>Filtrar por estado:</Text>
          <View style={styles.filtroButtons}>
            <TouchableOpacity
              style={[styles.filtroButton, !filtroEstado && styles.filtroButtonActive]}
              onPress={() => setFiltroEstado('')}
            >
              <Text style={[styles.filtroButtonText, !filtroEstado && styles.filtroButtonTextActive]}>
                Todos
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filtroButton, filtroEstado === 'pendiente' && styles.filtroButtonActive]}
              onPress={() => setFiltroEstado('pendiente')}
            >
              <Text style={[styles.filtroButtonText, filtroEstado === 'pendiente' && styles.filtroButtonTextActive]}>
                Pendientes
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filtroButton, filtroEstado === 'aprobada' && styles.filtroButtonActive]}
              onPress={() => setFiltroEstado('aprobada')}
            >
              <Text style={[styles.filtroButtonText, filtroEstado === 'aprobada' && styles.filtroButtonTextActive]}>
                Aprobadas
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filtroButton, filtroEstado === 'denegada' && styles.filtroButtonActive]}
              onPress={() => setFiltroEstado('denegada')}
            >
              <Text style={[styles.filtroButtonText, filtroEstado === 'denegada' && styles.filtroButtonTextActive]}>
                Denegadas
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Lista de solicitudes */}
        {solicitudes.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No hay solicitudes</Text>
          </View>
        ) : (
          <View style={styles.listContainer}>
            {solicitudes.map((item) => (
              <SolicitudItem key={item.id_solicitud} item={item} />
            ))}
          </View>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Modal de detalle y acción */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={cerrarModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Detalle de Solicitud</Text>
              <TouchableOpacity onPress={cerrarModal}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              {solicitudSeleccionada && (
                <>
                  <View style={styles.infoSection}>
                    <Text style={styles.infoTitle}>👤 Solicitante</Text>
                    <View style={styles.infoItem}>
                      <Text style={styles.infoLabel}>Nombre</Text>
                      <Text style={styles.infoValue}>{solicitudSeleccionada.solicitante}</Text>
                    </View>
                    <View style={styles.infoItem}>
                      <Text style={styles.infoLabel}>Email</Text>
                      <Text style={styles.infoValue}>{solicitudSeleccionada.email}</Text>
                    </View>
                    <View style={styles.infoItem}>
                      <Text style={styles.infoLabel}>Teléfono</Text>
                      <Text style={styles.infoValue}>{solicitudSeleccionada.telefono || '-'}</Text>
                    </View>
                  </View>

                  <View style={styles.infoSection}>
                    <Text style={styles.infoTitle}>👥 Visitante</Text>
                    <View style={styles.infoItem}>
                      <Text style={styles.infoLabel}>Nombre</Text>
                      <Text style={styles.infoValue}>{solicitudSeleccionada.visitante}</Text>
                    </View>
                    <View style={styles.infoItem}>
                      <Text style={styles.infoLabel}>Motivo</Text>
                      <Text style={styles.infoValue}>{solicitudSeleccionada.motivo}</Text>
                    </View>
                  </View>

                  <View style={styles.infoSection}>
                    <Text style={styles.infoTitle}>📅 Horario</Text>
                    <View style={styles.infoItem}>
                      <Text style={styles.infoLabel}>Fecha</Text>
                      <Text style={styles.infoValue}>{solicitudSeleccionada.fecha_ingreso}</Text>
                    </View>
                    <View style={styles.infoItem}>
                      <Text style={styles.infoLabel}>Hora</Text>
                      <Text style={styles.infoValue}>
                        {solicitudSeleccionada.hora_inicio} - {solicitudSeleccionada.hora_fin}
                      </Text>
                    </View>
                  </View>

                  {solicitudSeleccionada.estado === 'Pendiente' && !mostrarOpcionesDenegacion && (
                    <View style={styles.actionButtons}>
                      <TouchableOpacity
                        style={[styles.button, styles.buttonApprove]}
                        onPress={handleAprobar}
                        disabled={procesando}
                      >
                        <Text style={styles.buttonText}>✅ Aprobar</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.button, styles.buttonDeny]}
                        onPress={() => setMostrarOpcionesDenegacion(true)}
                        disabled={procesando}
                      >
                        <Text style={styles.buttonText}>❌ Denegar</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {mostrarOpcionesDenegacion && (
                    <View style={styles.denyContainer}>
                      <Text style={styles.denyLabel}>Motivo de denegación:</Text>
                      <TextInput
                        style={styles.textArea}
                        placeholder="Especifica el motivo..."
                        value={motivoDenegacion}
                        onChangeText={setMotivoDenegacion}
                        multiline
                        numberOfLines={4}
                        editable={!procesando}
                      />
                      <View style={styles.actionButtons}>
                        <TouchableOpacity
                          style={[styles.button, styles.buttonDeny]}
                          onPress={handleDenegar}
                          disabled={procesando}
                        >
                          <Text style={styles.buttonText}>Confirmar Negación</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.button, styles.buttonCancel]}
                          onPress={() => setMostrarOpcionesDenegacion(false)}
                          disabled={procesando}
                        >
                          <Text style={styles.buttonText}>Cancelar</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}

                  {solicitudSeleccionada.estado !== 'Pendiente' && (
                    <View style={styles.infoSection}>
                      <Text style={styles.infoTitle}>📋 Resultado</Text>
                      <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Estado</Text>
                        <Text style={[styles.infoValue, { color: getColorEstado(solicitudSeleccionada.estado) }]}>
                          {solicitudSeleccionada.estado}
                        </Text>
                      </View>
                      {solicitudSeleccionada.motivo_denegacion && (
                        <View style={styles.infoItem}>
                          <Text style={styles.infoLabel}>Motivo</Text>
                          <Text style={styles.infoValue}>{solicitudSeleccionada.motivo_denegacion}</Text>
                        </View>
                      )}
                    </View>
                  )}
                </>
              )}
            </ScrollView>

            {solicitudSeleccionada?.estado === 'Pendiente' && !mostrarOpcionesDenegacion && (
              <TouchableOpacity
                style={[styles.button, styles.buttonClose]}
                onPress={cerrarModal}
              >
                <Text style={styles.buttonText}>Cerrar</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  header: {
    backgroundColor: '#0056b3',
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 20
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff'
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 10,
    marginVertical: 15
  },
  statCard: {
    width: '48%',
    backgroundColor: '#fff',
    marginHorizontal: '1%',
    marginVertical: 8,
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderRadius: 10,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textTransform: 'uppercase'
  },
  filtrosContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginVertical: 10,
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3
  },
  filtroLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 10,
    textTransform: 'uppercase'
  },
  filtroButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  filtroButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 5,
    borderWidth: 1,
    borderColor: '#ddd'
  },
  filtroButtonActive: {
    backgroundColor: '#0056b3',
    borderColor: '#0056b3'
  },
  filtroButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333'
  },
  filtroButtonTextActive: {
    color: '#fff'
  },
  listContainer: {
    paddingHorizontal: 15
  },
  solicitudItem: {
    backgroundColor: '#fff',
    marginVertical: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3
  },
  solicitudHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  solicitudId: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0056b3'
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
    textTransform: 'capitalize'
  },
  solicitudSolicitante: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 3
  },
  solicitudSubtitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 3
  },
  solicitudMotivo: {
    fontSize: 13,
    fontWeight: '500',
    color: '#555',
    marginBottom: 3
  },
  solicitudFecha: {
    fontSize: 12,
    color: '#999',
    marginTop: 5
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: 'center'
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end'
  },
  modal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingTop: 20
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333'
  },
  closeButton: {
    fontSize: 24,
    color: '#999'
  },
  modalContent: {
    paddingHorizontal: 15,
    paddingVertical: 15
  },
  infoSection: {
    marginBottom: 20
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0056b3',
    marginBottom: 10
  },
  infoItem: {
    backgroundColor: '#f9f9f9',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 8
  },
  infoLabel: {
    fontSize: 11,
    color: '#999',
    textTransform: 'uppercase',
    marginBottom: 3
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333'
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
    marginVertical: 15
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center'
  },
  buttonApprove: {
    backgroundColor: '#28a745'
  },
  buttonDeny: {
    backgroundColor: '#dc3545'
  },
  buttonCancel: {
    backgroundColor: '#6c757d'
  },
  buttonClose: {
    backgroundColor: '#0056b3',
    marginHorizontal: 15,
    marginVertical: 15
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600'
  },
  denyContainer: {
    backgroundColor: '#fff3cd',
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderRadius: 8,
    marginBottom: 15
  },
  denyLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#856404',
    marginBottom: 10
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
    fontSize: 13,
    backgroundColor: '#fff',
    minHeight: 100,
    textAlignVertical: 'top'
  }
});
