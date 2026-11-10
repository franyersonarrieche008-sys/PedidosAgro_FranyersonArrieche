import { useState } from 'react';
import {
  Button,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

const colors = {
  background: '#F3F7F1',
  surface: '#FFFFFF',
  primary: '#2F6B45',
  primaryDark: '#214E33',
  text: '#1C2B21',
  muted: '#66756A',
  border: '#DCE6DC',
  success: '#E8F5EC',
  successText: '#205B34',
  error: '#FFF0ED',
  errorText: '#A13B2B',
};

const currencyFormatter = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

function parseUnitPrice(value) {
  const cleaned = value.trim().replace(/\s/g, '').replace(/^\$/, '');

  if (!cleaned) {
    return null;
  }

  const isNegative = cleaned.startsWith('-');
  const unsigned = cleaned.replace(/^[+-]/, '');
  let normalized;

  if (unsigned.includes('.') && unsigned.includes(',')) {
    if (!/^\d+(?:\.\d{3})*(?:,\d+)?$/.test(unsigned)) {
      return null;
    }

    normalized = unsigned.replace(/\./g, '').replace(',', '.');
  } else if (unsigned.includes(',')) {
    if (!/^\d+,\d+$/.test(unsigned)) {
      return null;
    }

    normalized = unsigned.replace(',', '.');
  } else if (unsigned.includes('.')) {
    if (/^\d{1,3}(?:\.\d{3})+$/.test(unsigned)) {
      normalized = unsigned.replace(/\./g, '');
    } else if (/^\d+(?:\.\d+)?$/.test(unsigned)) {
      normalized = unsigned;
    } else {
      return null;
    }
  } else if (/^\d+$/.test(unsigned)) {
    normalized = unsigned;
  } else {
    return null;
  }

  const price = Number(normalized);
  return Number.isFinite(price) ? (isNegative ? -price : price) : null;
}

export default function App() {
  const [customer, setCustomer] = useState('');
  const [product, setProduct] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [orderCount, setOrderCount] = useState(0);
  const [feedback, setFeedback] = useState(null);

  function registerOrder() {
    const customerName = customer.trim();
    const productName = product.trim();
    const parsedQuantity = Number(quantity.trim());
    const parsedUnitPrice = parseUnitPrice(unitPrice);

    if (!customerName) {
      setFeedback({
        type: 'error',
        text: 'Debe ingresar el nombre del cliente',
      });
      return;
    }

    if (!productName) {
      setFeedback({
        type: 'error',
        text: 'Debe ingresar un producto',
      });
      return;
    }

    if (!/^\d+$/.test(quantity.trim()) || !Number.isSafeInteger(parsedQuantity) || parsedQuantity < 1) {
      setFeedback({
        type: 'error',
        text: 'Ingrese una cantidad válida',
      });
      return;
    }

    if (parsedUnitPrice === null || parsedUnitPrice < 0) {
      setFeedback({
        type: 'error',
        text: 'Ingrese un precio unitario válido',
      });
      return;
    }

    const total = parsedQuantity * parsedUnitPrice;
    if (!Number.isFinite(total)) {
      setFeedback({
        type: 'error',
        text: 'El total del pedido no es válido',
      });
      return;
    }

    setOrderCount((currentCount) => currentCount + 1);
    setFeedback({
      type: 'success',
      text: 'Pedido registrado correctamente',
      customer: customerName,
      product: productName,
      quantity: parsedQuantity,
      total: currencyFormatter.format(total),
    });
  }

  function clearForm() {
    setCustomer('');
    setProduct('');
    setQuantity('');
    setUnitPrice('');
    setFeedback(null);
  }

  return (
    <View style={styles.screen}>
      <StatusBar backgroundColor={colors.background} barStyle="dark-content" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.eyebrow}>MOSQUERA · PEDIDOS DEL CAMPO</Text>
            <Text style={styles.title}>Pedidos Agro</Text>
            <Text style={styles.welcome}>
              ¡Bienvenido! Registra aquí el pedido de tu cliente.
            </Text>
          </View>

          <View style={styles.counterCard}>
            <View>
              <Text style={styles.counterLabel}>PEDIDOS REGISTRADOS</Text>
              <Text style={styles.counterHint}>En esta sesión</Text>
            </View>
            <Text style={styles.counterValue}>{orderCount}</Text>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.sectionTitle}>Nuevo pedido</Text>
            <Text style={styles.sectionHint}>
              Completa los datos para calcular el valor de la compra.
            </Text>

            <Text style={styles.label}>Nombre del cliente</Text>
            <TextInput
              accessibilityLabel="Nombre del cliente"
              autoCapitalize="words"
              onChangeText={setCustomer}
              placeholder="Ej. María Gómez"
              placeholderTextColor="#8A978D"
              returnKeyType="next"
              style={styles.input}
              value={customer}
            />

            <Text style={styles.label}>Producto solicitado</Text>
            <TextInput
              accessibilityLabel="Producto solicitado"
              autoCapitalize="sentences"
              onChangeText={setProduct}
              placeholder="Ej. Bulto de concentrado"
              placeholderTextColor="#8A978D"
              returnKeyType="next"
              style={styles.input}
              value={product}
            />

            <View style={styles.fieldRow}>
              <View style={styles.halfField}>
                <Text style={styles.label}>Cantidad</Text>
                <TextInput
                  accessibilityLabel="Cantidad"
                  keyboardType="number-pad"
                  onChangeText={setQuantity}
                  placeholder="Ej. 5"
                  placeholderTextColor="#8A978D"
                  returnKeyType="next"
                  style={styles.input}
                  value={quantity}
                />
              </View>
              <View style={styles.halfField}>
                <Text style={styles.label}>Precio unitario</Text>
                <TextInput
                  accessibilityLabel="Precio unitario"
                  keyboardType="decimal-pad"
                  onChangeText={setUnitPrice}
                  placeholder="Ej. 3000"
                  placeholderTextColor="#8A978D"
                  returnKeyType="done"
                  style={styles.input}
                  value={unitPrice}
                />
              </View>
            </View>

            {feedback ? (
              <View
                accessibilityLiveRegion="polite"
                style={[
                  styles.feedback,
                  feedback.type === 'success' ? styles.successFeedback : styles.errorFeedback,
                ]}
              >
                <Text
                  style={[
                    styles.feedbackTitle,
                    feedback.type === 'success' ? styles.successText : styles.errorText,
                  ]}
                >
                  {feedback.text}
                </Text>
                {feedback.type === 'success' ? (
                  <Text style={[styles.feedbackDetails, styles.successText]}>
                    Cliente: {feedback.customer}{'\n'}
                    Producto: {feedback.product}{'\n'}
                    Cantidad: {feedback.quantity}{'\n'}
                    Total: {feedback.total}
                  </Text>
                ) : null}
              </View>
            ) : null}

            <View style={styles.primaryButton}>
              <Button
                color={colors.primary}
                onPress={registerOrder}
                title="Registrar pedido"
              />
            </View>
            <View style={styles.secondaryButton}>
              <Button color={colors.primaryDark} onPress={clearForm} title="Limpiar formulario" />
            </View>
          </View>

          <Text style={styles.footer}>
            Tus pedidos se mantienen solo mientras esta aplicación esté abierta.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 28,
  },
  container: {
    width: '100%',
    maxWidth: 520,
  },
  header: {
    marginBottom: 22,
  },
  eyebrow: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  title: {
    color: colors.text,
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  welcome: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 6,
  },
  counterCard: {
    alignItems: 'center',
    backgroundColor: colors.primaryDark,
    borderRadius: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  counterLabel: {
    color: '#E7F1E8',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  counterHint: {
    color: '#C6D9C9',
    fontSize: 13,
    marginTop: 4,
  },
  counterValue: {
    color: colors.surface,
    fontSize: 34,
    fontWeight: '800',
  },
  formCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 21,
    fontWeight: '700',
  },
  sectionHint: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
    marginTop: 5,
  },
  label: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 7,
  },
  input: {
    backgroundColor: '#FBFCFA',
    borderColor: colors.border,
    borderRadius: 11,
    borderWidth: 1,
    color: colors.text,
    fontSize: 16,
    minHeight: 50,
    paddingHorizontal: 13,
    paddingVertical: 12,
  },
  fieldRow: {
    flexDirection: 'row',
    gap: 12,
  },
  halfField: {
    flex: 1,
  },
  feedback: {
    borderRadius: 11,
    marginTop: 18,
    padding: 14,
  },
  successFeedback: {
    backgroundColor: colors.success,
  },
  errorFeedback: {
    backgroundColor: colors.error,
  },
  feedbackTitle: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  feedbackDetails: {
    fontSize: 14,
    lineHeight: 22,
    marginTop: 7,
  },
  successText: {
    color: colors.successText,
  },
  errorText: {
    color: colors.errorText,
  },
  primaryButton: {
    marginTop: 20,
  },
  secondaryButton: {
    marginTop: 8,
  },
  footer: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18,
    paddingHorizontal: 8,
    paddingVertical: 18,
    textAlign: 'center',
  },
});
