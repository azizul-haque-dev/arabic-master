import { Check, Globe, MapPin, Search, X } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { useOnboardingStore } from "@/features/onboarding/store";

type CountryOption = {
  name: string;
  nativeName: string;
  arabicName: string;
  flag: string;
  tag?: string;
};

const countries: CountryOption[] = [
  {
    name: "Saudi Arabia",
    nativeName: "সৌদি আরব",
    arabicName: "السعودية",
    flag: "🇸🇦",
    tag: "★ Most Popular",
  },
  {
    name: "United Arab Emirates",
    nativeName: "সংযুক্ত আরব আমিরাত (UAE)",
    arabicName: "الإمارات",
    flag: "🇦🇪",
  },
  {
    name: "Qatar",
    nativeName: "কাতার",
    arabicName: "قطر",
    flag: "🇶🇦",
  },
  {
    name: "Kuwait",
    nativeName: "কুয়েত",
    arabicName: "الكويت",
    flag: "🇰🇼",
  },
  {
    name: "Oman",
    nativeName: "ওমান",
    arabicName: "عُمان",
    flag: "🇴🇲",
  },
  {
    name: "Bahrain",
    nativeName: "বাহরাইন",
    arabicName: "البحرين",
    flag: "🇧🇭",
  },
  {
    name: "Bangladesh",
    nativeName: "বাংলাদেশ",
    arabicName: "بنغلاديশ",
    flag: "🇧🇩",
    tag: "Preparing abroad",
  },
  {
    name: "Other",
    nativeName: "অন্যান্য দেশ",
    arabicName: "دول أخرى",
    flag: "🌐",
  },
];

export default function CountryScreen() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const selectedCountry = useOnboardingStore((state) => state.country);
  const setCountry = useOnboardingStore((state) => state.setCountry);

  const filteredCountries = countries.filter((country) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      country.name.toLowerCase().includes(q) ||
      country.nativeName.toLowerCase().includes(q) ||
      country.arabicName.includes(q)
    );
  });

  return (
    <OnboardingLayout
      step={2}
      headerContent={
        <View className="mb-2 flex-row items-center">
          <View className="flex-row items-center gap-2 rounded-full bg-surface-container px-3.5 py-1 border border-outline-variant">
            <View className="h-1.5 w-1.5 rounded-full bg-primary" />
            <Text className="font-label-sm text-xs font-semibold text-on-surface-variant tracking-wider uppercase">
              Step 2 of 4 • Location
            </Text>
          </View>
        </View>
      }
      title="Where are you living?"
      subtitle="আপনার বর্তমান অবস্থান বেছে নিন — এর ওপর ভিত্তি করে প্রাসঙ্গিক আরবি ডায়লগ ও কথ্যরীতি সাজানো হবে।"
      onBack={() => router.back()}
      continueDisabled={!selectedCountry}
      onContinue={() => router.push("/onboarding/goals")}
      onSkip={() => router.push("/onboarding/goals")}
    >
      {/* Modern Search Input Container */}
      <View className="mb-4 min-h-[50px] flex-row items-center gap-3 rounded-2xl border border-outline-variant bg-surface-container-low px-4 focus-within:border-primary focus-within:bg-surface">
        <Search size={18} color="#737373" strokeWidth={2.2} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search country (e.g. Saudi, কাতার)..."
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
            className="h-6 w-6 items-center justify-center rounded-full bg-surface-container active:opacity-70"
          >
            <X size={14} color="#737373" strokeWidth={2.5} />
          </Pressable>
        ) : null}
      </View>

      {/* Country List Options */}
      {filteredCountries.length > 0 ? (
        <View
          className="gap-3"
          accessibilityRole="radiogroup"
          accessibilityLabel="Choose your country"
        >
          {filteredCountries.map((country) => {
            const isSelected = selectedCountry === country.name;
            return (
              <Pressable
                key={country.name}
                onPress={() => setCountry(country.name)}
                accessibilityRole="radio"
                accessibilityState={{ checked: isSelected }}
                aria-checked={isSelected}
                accessibilityLabel={`${country.name}, ${country.nativeName}`}
                className={`min-h-[82px] flex-row items-center justify-between rounded-2xl p-5 border-2 active:opacity-90 ${
                  isSelected
                    ? "border-primary bg-primary-subtle"
                    : "border-outline-variant bg-surface"
                }`}
              >
                <View className="min-w-0 flex-1 flex-row items-center gap-4">
                  {/* Flag Avatar */}
                  <View
                    className={`h-12 w-12 items-center justify-center rounded-2xl border ${
                      isSelected
                        ? "border-primary/40 bg-white"
                        : "border-outline-variant/80 bg-surface-container"
                    }`}
                  >
                    <Text className="text-2xl">{country.flag}</Text>
                  </View>

                  {/* Country Labels */}
                  <View className="min-w-0 flex-1">
                    <View className="flex-row items-center gap-2">
                      <Text
                        className={`font-label-lg text-base font-bold leading-tight ${
                          isSelected ? "text-primary-strong" : "text-on-surface"
                        }`}
                      >
                        {country.name}
                      </Text>
                      {country.tag ? (
                        <View
                          className={`rounded-full px-2.5 py-0.5 ${
                            isSelected ? "bg-primary" : "bg-primary-subtle"
                          }`}
                        >
                          <Text
                            className={`text-[10px] font-bold ${
                              isSelected ? "text-white" : "text-primary-strong"
                            }`}
                          >
                            {country.tag}
                          </Text>
                        </View>
                      ) : null}
                    </View>
                    <Text className="mt-1 font-body-sm text-xs font-medium text-on-surface-variant">
                      {country.nativeName} • {country.arabicName}
                    </Text>
                  </View>
                </View>

                {/* Radio Indicator */}
                <View className="ml-4 shrink-0">
                  {isSelected ? (
                    <View className="h-6 w-6 items-center justify-center rounded-full bg-primary">
                      <Check color="#ffffff" size={14} strokeWidth={3} />
                    </View>
                  ) : (
                    <View className="h-6 w-6 rounded-full border-2 border-outline-variant" />
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>
      ) : (
        /* Empty State */
        <View className="items-center rounded-2xl border border-outline-variant bg-surface-container-low p-8">
          <View className="mb-3 h-12 w-12 items-center justify-center rounded-2xl bg-surface-container">
            <Globe size={24} color="#737373" />
          </View>
          <Text className="text-base font-bold text-on-surface">
            No countries found
          </Text>
          <Text className="mt-1 text-center font-body-sm text-sm text-on-surface-variant">
            “{search}” খুঁজে পাওয়া যায়নি। আপনি “Other” নির্বাচন করে এগিয়ে যেতে
            পারেন।
          </Text>
          <Pressable
            onPress={() => {
              setCountry("Other");
              setSearch("");
            }}
            accessibilityRole="button"
            className="mt-4 rounded-xl bg-primary px-5 py-2.5 active:opacity-90"
          >
            <Text className="font-label-md text-sm font-bold text-white">
              Choose “Other”
            </Text>
          </Pressable>
        </View>
      )}

      {/* Helpful Dialect Personalization Footer */}
      <View className="mt-6 flex-row items-start gap-3 rounded-2xl border border-outline-variant bg-surface-container-low p-4">
        <View className="mt-0.5 h-7 w-7 items-center justify-center rounded-lg bg-primary-subtle">
          <MapPin size={16} color="#15803d" strokeWidth={2.2} />
        </View>
        <View className="flex-1">
          <Text className="font-semibold text-xs text-on-surface">
            Dialect Personalization
          </Text>
          <Text className="mt-0.5 text-xs text-on-surface-variant leading-relaxed">
            Local terms and dialect nuances (যেমন সৌদি বা আমিরাতি কথ্যরীতি)
            স্বয়ংক্রিয়ভাবে আপনার পাঠ্যক্রমে যুক্ত হবে।
          </Text>
        </View>
      </View>
    </OnboardingLayout>
  );
}
