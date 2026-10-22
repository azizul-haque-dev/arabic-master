import {
  Building2,
  Compass,
  Globe,
  Landmark,
  MapPin,
  Search,
  X,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { OptionCard } from "@/components/onboarding/OptionCard";
import { useOnboardingStore } from "@/features/onboarding/store";

const countries: { name: string; Icon: typeof Landmark; isPrimaryBrand?: boolean }[] = [
  { name: "Saudi Arabia", Icon: Landmark, isPrimaryBrand: true },
  { name: "United Arab Emirates", Icon: Building2 },
  { name: "Qatar", Icon: MapPin },
  { name: "Kuwait", Icon: Compass },
  { name: "Bahrain", Icon: Building2 },
  { name: "Oman", Icon: Compass },
  { name: "Other", Icon: Globe },
];

export default function CountryScreen() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const selectedCountry = useOnboardingStore((state) => state.country);
  const setCountry = useOnboardingStore((state) => state.setCountry);

  const filteredCountries = countries.filter((country) =>
    country.name.toLowerCase().includes(search.trim().toLowerCase()),
  );

  return (
    <OnboardingLayout
      step={2}
      title="Where are you living?"
      subtitle="We’ll use this to make your Arabic practice more relevant to everyday life."
      onBack={() => router.back()}
      continueDisabled={!selectedCountry}
      onContinue={() => router.push("/onboarding/goals")}
      onSkip={() => router.push("/onboarding/goals")}
    >
      {/* Search Input Container */}
      <View className="mb-4 min-h-12 flex-row items-center gap-2.5 rounded-xl border border-outline-variant bg-surface-container-lowest px-3.5 focus-within:border-primary">
        <Search className="text-on-surface-variant" size={18} strokeWidth={2.2} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search country..."
          placeholderTextColor="#737373"
          autoCapitalize="none"
          autoCorrect={false}
          accessibilityLabel="Search country"
          className="min-w-0 flex-1 py-3 font-body-md text-sm text-on-surface"
          returnKeyType="search"
        />
        {search.length > 0 ? (
          <Pressable
            onPress={() => setSearch("")}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Clear search"
            className="h-6 w-6 items-center justify-center rounded-full bg-surface-container"
          >
            <X size={14} className="text-on-surface-variant" strokeWidth={2.5} />
          </Pressable>
        ) : null}
      </View>

      {/* Country List Options */}
      {filteredCountries.length > 0 ? (
        <View
          className="gap-2.5"
          accessibilityRole="radiogroup"
          accessibilityLabel="Choose your country"
        >
          {filteredCountries.map(({ name, Icon, isPrimaryBrand }) => {
            const isSelected = selectedCountry === name;
            return (
              <OptionCard
                key={name}
                label={name}
                selected={isSelected}
                onPress={() => setCountry(name)}
                leading={
                  <View
                    className={`h-8 w-8 items-center justify-center rounded-lg ${
                      isSelected || isPrimaryBrand
                        ? "bg-primary text-on-primary"
                        : "bg-surface-container text-on-surface"
                    }`}
                  >
                    <Icon
                      size={17}
                      strokeWidth={2}
                      className={
                        isSelected || isPrimaryBrand
                          ? "text-on-primary"
                          : "text-on-surface"
                      }
                    />
                  </View>
                }
              />
            );
          })}
        </View>
      ) : (
        <View className="items-center rounded-xl bg-surface-container-low p-6">
          <Text className="text-center font-body-md text-sm text-on-surface-variant">
            No countries match “{search}”.
          </Text>
        </View>
      )}
    </OnboardingLayout>
  );
}

