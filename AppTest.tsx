import { Text, View } from 'react-native';

export default function AppTest() {
  return (
    <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ color: '#fff', fontSize: 24, fontWeight: 'bold' }}>
        App is Running!
      </Text>
    </View>
  );
}
