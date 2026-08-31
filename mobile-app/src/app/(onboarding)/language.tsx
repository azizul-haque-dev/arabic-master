// import { router } from "expo-router";
// import { Languages } from "lucide-react-native";
// import { Pressable, Text, View } from "react-native";

// import { OnboardingProgressHeader } from "@/components/onboarding/OnboardingProgressHeader";
// import { RadioOptionCard } from "@/components/onboarding/RadioOptionCard";
// // import { colors } from "@/constants/colors";
// import { colors } from "@/constants/colors";
// import { useLanguageStore, type LanguageCode } from "@/stores/languageStore";
// import { SafeAreaView } from "react-native-safe-area-context";

// const LANGUAGE_OPTIONS: Array<{
//   code: LanguageCode;
//   flag: string;
//   title: string;
//   titleFontClassName: string;
//   subtitle: string;
// }> = [
//   {
//     code: "bn",
//     flag: "🇧🇩",
//     title: "বাংলা",
//     titleFontClassName: "font-bangla",
//     subtitle: "Learn Arabic with Bangla explanations",
//   },
//   {
//     code: "en",
//     flag: "🇬🇧",
//     title: "English",
//     titleFontClassName: "font-sans",
//     subtitle: "Learn Arabic with English explanations",
//   },
// ];

// export default function LanguageOnboardingScreen() {
//   const language = useLanguageStore((state) => state.language);

//   const setLanguage = useLanguageStore((state) => state.setLanguage);

//   return (
//     <SafeAreaView className="flex-1 bg-background">
//       <OnboardingProgressHeader step={1} totalSteps={4} />

//       <View className="flex-1 px-6">
//         <View className="mt-8 items-center">
//           <View className="h-16 w-16 items-center justify-center rounded-2xl bg-primary-light">
//             <Languages size={28} color={colors.primary} />
//           </View>

//           <Text className="mt-6 text-center text-2xl font-bold text-text-main">
//             Choose your language
//           </Text>

//           <Text className="mt-2 text-center text-base text-muted">
//             We'll use this language to guide you while you learn Arabic.
//           </Text>
//         </View>

//         <View className="mt-8 gap-4">
//           {LANGUAGE_OPTIONS.map((option) => (
//             <RadioOptionCard
//               key={option.code}
//               icon={<Text className="text-3xl">{option.flag}</Text>}
//               title={option.title}
//               titleFontClassName={option.titleFontClassName}
//               subtitle={option.subtitle}
//               selected={language === option.code}
//               onPress={() => setLanguage(option.code)}
//             />
//           ))}
//         </View>
//       </View>

//       <View className="px-6 pb-8 pt-4">
//         <Pressable
//           onPress={() => router.push("/(onboarding)/level")}
//           className="h-14 w-full items-center justify-center rounded-2xl bg-primary active:bg-primary-hover"
//         >
//           <Text className="text-base font-semibold text-white">Continue →</Text>
//         </Pressable>
//       </View>
//     </SafeAreaView>
//   );
// }

import { ArrowRight, Check } from "lucide-react-native";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type LanguageCode = "bn" | "en";

interface LanguageOption {
  code: LanguageCode;
  flag: string;
  title: string;
  description: string;
}

const LANGUAGES: LanguageOption[] = [
  {
    code: "bn",
    flag: "🇧🇩",
    title: "বাংলা",
    description: "Learn Arabic with Bangla explanations",
  },
  {
    code: "en",
    flag: "🇬🇧",
    title: "English",
    description: "Learn Arabic with English explanations",
  },
];

export default function LanguageScreen() {
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>("bn");

  const handleContinue = () => {
    console.log("Selected language:", selectedLanguage);

    // Navigate to next onboarding screen
    // router.push("/onboarding/level");
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FAFAFA]" edges={["top", "bottom"]}>
      <View className="flex-1">
        {/* ========================================
            TOP HEADER
        ======================================== */}

        <View className="w-full px-4 pt-6 pb-4">
          {/* Logo */}
          {/* <View className="h-12 w-full items-center justify-center">
            <Image
              source={{
                uri: "https://lh3.googleusercontent.com/aida/AEtjO1XEk2QNOzM4amzU6ghTV7ytz0TiiP3583fs8q5wgFZOUG-IayZ-MKdvsX-Bh_3EKaZm3b5BArtz3GmC3MlBgKIl6non2rQkis4t8mouR3MEXItk5j5PmDxn2kpMQD7QZzORaO0UKUwOyAw2c_bjwiXvGPCGHM4826gylchv4QBDqSxuar1sWgpwWuooQgeit78D1liy5yfkeh63fdkJwYfXsSyy7XvR46Xufa-Mr0IVnD_E0ihKqEqLXGw",
              }}
              resizeMode="contain"
              className="h-10 w-40"
            />
          </View> */}

          {/* Top Progress */}
          {/* <View className="mt-6 h-2 overflow-hidden rounded-full bg-[#E7E9E7]">
            <View
              className="h-full rounded-full bg-[#0F766E]"
              style={{ width: "25%" }}
            />
          </View> */}
        </View>

        {/* ========================================
            MAIN CONTENT
        ======================================== */}

        <ScrollView
          className="flex-1"
          contentContainerClassName="px-4 pt-6 pb-32"
          showsVerticalScrollIndicator={false}
        >
          {/* Progress Header */}

          <View className="gap-2">
            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-[#6B716E]">Step 1 of 4</Text>

              <Text className="text-sm font-bold text-[#0F766E]">25%</Text>
            </View>

            <View className="h-2 overflow-hidden rounded-full bg-[#E7E9E7]">
              <View
                className="h-full rounded-full bg-[#0F766E]"
                style={{ width: "25%" }}
              />
            </View>
          </View>

          {/* ========================================
              ICON + TITLE
          ======================================== */}

          <View className="mt-10 items-center">
            {/* Arabic Icon */}

            <View className="h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-[#E6F4F1]">
              <Text
                className="text-4xl text-[#0F766E]"
                style={{
                  fontFamily: "System",
                }}
              >
                ع
              </Text>
            </View>

            {/* Heading */}

            <View className="mt-4 items-center">
              <Text className="text-center text-2xl font-bold text-[#1C211F]">
                Choose your language
              </Text>

              <Text className="mt-2 max-w-[280px] text-center text-base leading-6 text-[#6B716E]">
                We'll use this language to guide you while you learn Arabic.
              </Text>
            </View>
          </View>

          {/* ========================================
              LANGUAGE OPTIONS
          ======================================== */}

          <View className="mt-8 gap-4">
            {LANGUAGES.map((language) => {
              const isSelected = selectedLanguage === language.code;

              return (
                <Pressable
                  key={language.code}
                  onPress={() => setSelectedLanguage(language.code)}
                  className={`relative flex-row items-start rounded-2xl p-5 ${
                    isSelected ? "bg-[#F7FCFB]" : "bg-white"
                  }`}
                  style={{
                    borderWidth: isSelected ? 2 : 1,
                    borderColor: isSelected ? "#0F766E" : "#D9DEDB",

                    shadowColor: "#000",
                    shadowOffset: {
                      width: 0,
                      height: 4,
                    },
                    shadowOpacity: isSelected ? 0.06 : 0.04,
                    shadowRadius: 12,
                    elevation: isSelected ? 2 : 1,
                  }}
                >
                  {/* Selected Background Tint */}

                  {isSelected && (
                    <View
                      className="absolute inset-0 rounded-2xl bg-[#0F766E]"
                      style={{
                        opacity: 0.03,
                      }}
                    />
                  )}

                  {/* Flag */}

                  <View className="mt-1 w-10">
                    <Text className="text-3xl">{language.flag}</Text>
                  </View>

                  {/* Text */}

                  <View className="flex-1">
                    <Text className="text-xl font-bold text-[#1C211F]">
                      {language.title}
                    </Text>

                    <Text className="mt-1 text-sm leading-5 text-[#6B716E]">
                      {language.description}
                    </Text>
                  </View>

                  {/* Radio / Check */}

                  <View className="ml-3 mt-2">
                    {isSelected ? (
                      <View className="h-6 w-6 items-center justify-center rounded-full bg-[#0F766E]">
                        <Check size={16} color="#FFFFFF" strokeWidth={3} />
                      </View>
                    ) : (
                      <View className="h-6 w-6 rounded-full border-2 border-[#D9DEDB]" />
                    )}
                  </View>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        {/* ========================================
            BOTTOM ACTION
        ======================================== */}

        <View className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-surface via-surface to-transparent pb-safe-offset-4">
          <Pressable
            onPress={handleContinue}
            className="w-full h-14 rounded-xl bg-primary-container text-on-primary font-label-md text-lg flex items-center justify-center gap-2 shadow-[0_8px_20px_-6px_rgba(39,174,96,0.4)] active:scale-[0.98] transition-all"
            style={({ pressed }) => ({
              opacity: pressed ? 0.9 : 1,
              transform: [
                {
                  scale: pressed ? 0.98 : 1,
                },
              ],
              shadowColor: "#0F766E",
              shadowOffset: {
                width: 0,
                height: 8,
              },
              shadowOpacity: 0.2,
              shadowRadius: 12,
              elevation: 4,
            })}
          >
            <Text className="text-lg font-bold text-white">Continue</Text>

            <ArrowRight
              size={20}
              color="#FFFFFF"
              strokeWidth={2.5}
              style={{
                marginLeft: 8,
              }}
            />
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
