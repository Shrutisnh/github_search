import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import {
  BackHandler,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { WebView } from "react-native-webview";

export default function CustomWebView() {
  const router = useRouter();
  const { webUrl, headerTitle } = useLocalSearchParams();

  const webViewRef = useRef(null);
  const canGoBackRef = useRef(false);

  // Android hardware back
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (canGoBackRef.current) {
          webViewRef.current.goBack();
          return true;
        }
        router.back();
        return true;
      }
    );

    return () => backHandler.remove();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>

        <Text style={styles.title} numberOfLines={1}>
          {headerTitle || "Web View"}
        </Text>
      </View>

      {/* WebView */}
      {webUrl ? (
        <WebView
          ref={webViewRef}
          source={{ uri: webUrl }}
          onNavigationStateChange={(navState) => {
            canGoBackRef.current = navState.canGoBack;
          }}
          startInLoadingState
        />
      ) : (
        <View style={{ padding: 20 }}>
          <Text>No URL provided</Text>
        </View>
      )}
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e5e5',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  backText: {
    fontSize: 20,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
});


