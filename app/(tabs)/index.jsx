import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Button, FlatList, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import * as ApiService from '../api/api_service';
import CustomInputText from '../components/CustomTextInput';
import DynamicBottomSheet from '../components/DynamicBottomSheet';
const PaginatedList = () => {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [text,setText] = useState('');
  const [order,setOrder] = useState('asc');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const sheetRef = useRef(null);

  const fetchData = async (searchText = text, pageToFetch = page) => {
    if (loading) return; // Prevent multiple simultaneous fetches
    setLoading(true);
    try {
      const response = await ApiService.fetchRepositories(pageToFetch, 'https://api.github.com/search/repositories', searchText, order);
      const newData = await response;

      // If fetching the first page for a new search, replace data; otherwise append
      setData(prevData => (pageToFetch === 1 ? [...newData] : [...prevData, ...newData]));
      setPage(prevPage => (pageToFetch === 1 ? 2 : prevPage + 1));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(text); // Initial data fetch
  }, []);

  const renderItem = ({ item }) => (
    <View style={{ padding: 20, borderBottomWidth: 1, borderColor: '#ccc' }}>
      <TouchableOpacity
        onPress={() => {
          router.push({
  pathname: "/custom_web_view",
  params: {
    webUrl: item.owner.html_url,
    headerTitle: item.name,
  },
});
        }
        }>
        <Text style={{ fontSize: 16, color: "blue" }}>{item.name}</Text>
        <Text style={{ fontSize: 14, color: "#555" }}>{item.owner.login}</Text>
      </TouchableOpacity>
    </View>
  );

  const renderFooter = () => {
    if (!loading) return null;
    return <ActivityIndicator size="large" color="#0000ff" style={{ paddingVertical: 20 }} />;
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }} edges={['top','left','right']}>
      
      <CustomInputText
        placeholder="Search the topic"
        onChangeText={setText}
        value={text}
        onSubmitEditing={() => {
          setData([]);
          setPage(1);
          fetchData(text, 1);
        }}
      />
      <Button title="Sort by" onPress={() => sheetRef.current?.open()} />

      <DynamicBottomSheet ref={sheetRef}>
        <View style={{ padding: 20, color: '#fff' }}>
        <Text style={{ fontSize: 18, marginBottom: 10,textAlign:'center' }}>
          Sort by
        </Text>
        <TouchableOpacity style={{ paddingVertical: 10 }}onPress={async () => {
          setOrder('asc');
          await fetchData(text, 1);
          sheetRef.current?.close();
      }}>
        <Text>
          Ascending
        </Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ paddingVertical: 10 }} onPress={async () => {
          setOrder('desc');
          await fetchData(text, 1);
          sheetRef.current?.close();
      }}>
        <Text>
          Descending
        </Text>
        </TouchableOpacity>
        </View>

        
      </DynamicBottomSheet>

      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        onEndReached={() => fetchData(text)} // Call fetchData when the end is reached
        onEndReachedThreshold={0.1} // Trigger when 10% from the bottom
        ListFooterComponent={renderFooter} // Show a loading indicator at the bottom
      />
    </SafeAreaView>
  );
};

export default PaginatedList;
