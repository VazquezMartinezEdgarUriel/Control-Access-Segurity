import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { solicitudService } from '../services/solicitudService';

export default function SolicitanteScreen() {
  const [loading, setLoading] = useState(false);
  const [solicitudId, setSolicitudId] = useState(null);
  const [formData, setFormData] = useState({
    nombre_solicitante: '',
    apellido_solicitante: '',
    email_solicitante: '',
    telefono_solicitante: '',
    nombre_visitante: '',
    apellido_visitante: '',
    motivo: '',
    fecha_ingreso: '',
    hora_inicio: '',
    hora_fin: ''
  });

  const handleChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validarFormulario = () => {
    if (!formData.nombre_solicitante.trim()) return 'Ingresa tu nombre';
    if (!formData.apellido_solicitante.trim()) return 'Ingresa tu apellido';
    if (!formData.email_solicitante.trim()) return 'Ingresa tu email';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email_solicitante)) return 'Email inválido';
    if (!formData.nombre_visitante.trim()) return 'Ingresa nombre del visitante';
    if (!formData.apellido_visitante.trim()) return 'Ingresa apellido del visitante';
    if (!formData.motivo.trim()) return 'Ingresa motivo de visita';
    if (!formData.fecha_ingreso.trim()) return 'Ingresa fecha de ingreso (AAAA-MM-DD)';
    if (!formData.hora_inicio.trim()) return 'Ingresa hora inicio (HH:MM)';
    if (!formData.hora_fin.trim()) return 'Ingresa hora fin (HH:MM)';
    if (formData.hora_fin <= formData.hora_inicio) return 'Hora fin debe ser mayor a hora inicio';
    return null;
  };

  const handleSubmit = async () => {
    const error = validarFormulario();
    if (error) {
      Alert.alert('Error', error);
      return;
    }

    setLoading(true);
    try {
      const resultado = await solicitudService.crearSolicitud(formData);
      if (resultado.success) {
        setSolicitudId(resultado.id_solicitud);
        setFormData({
          nombre_solicitante: '',
          apellido_solicitante: '',
          email_solicitante: '',
          telefono_solicitante: '',
          nombre_visitante: '',
          apellido_visitante: '',
          motivo: '',
          fecha_ingreso: '',
          hora_inicio: '',
          hora_fin: ''
        });
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNuevaCompare = () => {
    setSolicitudId(null);
  };

  if (solicitudId) {
    return (
      <View style={styles.container}>
        <View style={styles.successCard}>
          <Text style={styles.successIcon}>✅</Text>
          <Text style={styles.successTitle}>¡Solicitud Enviada!</Text>
          <Text style={styles.successText}>
            Tu solicitud ha sido registrada correctamente
          </Text>
          <View style={styles.idBox}>
            <Text style={styles.idLabel}>ID de Solicitud</Text>
            <Text style={styles.idValue}>#{solicitudId}</Text>
          </View>
          <Text style={styles.infoText}>
            El administrador revisará tu solicitud y te notificará lo antes posible
          </Text>
          <TouchableOpacity
            style={styles.buttonPrimary}
            onPress={handleNuevaCompare}
          >
            <Text style={styles.buttonText}>Nueva Solicitud</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>📋 Solicitud de Ingreso</Text>
          <Text style={styles.subtitle}>Visitante Externo</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👤 Datos Personales</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Nombre *"
            value={formData.nombre_solicitante}
            onChangeText={(text) => handleChange('nombre_solicitante', text)}
            editable={!loading}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Apellido *"
            value={formData.apellido_solicitante}
            onChangeText={(text) => handleChange('apellido_solicitante', text)}
            editable={!loading}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Email *"
            value={formData.email_solicitante}
            onChangeText={(text) => handleChange('email_solicitante', text)}
            keyboardType="email-address"
            editable={!loading}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Teléfono (opcional)"
            value={formData.telefono_solicitante}
            onChangeText={(text) => handleChange('telefono_solicitante', text)}
            keyboardType="phone-pad"
            editable={!loading}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👥 Datos del Visitante</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Nombre *"
            value={formData.nombre_visitante}
            onChangeText={(text) => handleChange('nombre_visitante', text)}
            editable={!loading}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Apellido *"
            value={formData.apellido_visitante}
            onChangeText={(text) => handleChange('apellido_visitante', text)}
            editable={!loading}
          />
          
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Motivo de visita *"
            value={formData.motivo}
            onChangeText={(text) => handleChange('motivo', text)}
            multiline
            numberOfLines={4}
            editable={!loading}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📅 Horario de Acceso</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Fecha (AAAA-MM-DD) *"
            value={formData.fecha_ingreso}
            onChangeText={(text) => handleChange('fecha_ingreso', text)}
            editable={!loading}
          />
          
          <View style={styles.row}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Hora inicio (HH:MM) *"
              value={formData.hora_inicio}
              onChangeText={(text) => handleChange('hora_inicio', text)}
              editable={!loading}
            />
            <TextInput
              style={[styles.input, { flex: 1, marginLeft: 10 }]}
              placeholder="Hora fin (HH:MM) *"
              value={formData.hora_fin}
              onChangeText={(text) => handleChange('hora_fin', text)}
              editable={!loading}
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.buttonPrimary, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Enviar Solicitud</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.buttonSecondary}>
          <Text style={styles.buttonTextSecondary}>Limpiar</Text>
        </TouchableOpacity>

        <View style={{ height: 20 }} />
      </ScrollView>
    </KeyboardAvoidingView>
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
    color: '#fff',
    marginBottom: 5
  },
  subtitle: {
    fontSize: 14,
    color: '#ddd'
  },
  section: {
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0056b3',
    marginBottom: 15
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 12,
    fontSize: 14,
    backgroundColor: '#f9f9f9'
  },
  textArea: {
    textAlignVertical: 'top',
    paddingVertical: 12,
    minHeight: 100
  },
  row: {
    flexDirection: 'row'
  },
  buttonPrimary: {
    backgroundColor: '#28a745',
    marginHorizontal: 15,
    marginVertical: 10,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttonSecondary: {
    backgroundColor: '#f5f5f5',
    marginHorizontal: 15,
    marginVertical: 5,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ddd'
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  buttonTextSecondary: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600'
  },
  buttonDisabled: {
    opacity: 0.6
  },
  successCard: {
    flex: 1,
    backgroundColor: '#fff',
    margin: 20,
    paddingHorizontal: 20,
    paddingVertical: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5
  },
  successIcon: {
    fontSize: 60,
    marginBottom: 15
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#28a745',
    marginBottom: 10,
    textAlign: 'center'
  },
  successText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center'
  },
  idBox: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 10,
    marginBottom: 20,
    width: '100%'
  },
  idLabel: {
    fontSize: 12,
    color: '#999',
    textTransform: 'uppercase',
    marginBottom: 5
  },
  idValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0056b3'
  },
  infoText: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20
  }
});
