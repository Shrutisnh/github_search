import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

export default function CustomInputText({
  label,
  value,
  onChangeText,
  placeholder,
  onSubmitEditing,
  error,
}) {
  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        style={[styles.input, error ? styles.inputError : null]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#666"
        onSubmitEditing={onSubmitEditing}
        returnKeyType="search"
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 10,
    marginBottom: 8,
    marginTop:10,
  },
  label: {
    marginBottom: 6,
    color: '#fff',
    fontSize: 12,
  },
  input: {
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 6,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  inputError: {
    borderColor: 'red',
    borderWidth: 1,
  },
  error: {
    color: 'red',
    marginTop: 6,
    fontSize: 12,
  },
});