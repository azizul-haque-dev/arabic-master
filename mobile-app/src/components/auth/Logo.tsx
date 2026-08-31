import { Image, View } from "react-native";

export function Logo() {
  return (
    <View className="items-center justify-center py-4">
      <Image
        source={{
          uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuAt3ctrOcVSd2QcemomQrCGRBFK2lO8ksCohLc3GwnpKajSfaK7wNtjHOxLWlAlwO7c8bau4Yl_vEhww5f_abgV28kOlCngZB-vmPaatYFrz8Cphiz6bT4dViD5hy5BGcWpNcpRcc-X2dB5FWJHgL7o3ig8GT3SVVAgMO_F76Z5UULB7ipHWu0amfHK3kN5RsdCVcQxe8IMlDZdcCBK4vcnsScqxNwJ644ku7fvRYhH93bKAOc76p3v9Q",
        }}
        className="h-20 w-20 rounded-2xl"
      />
    </View>
  );
}
