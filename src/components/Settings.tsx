import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
  SafeAreaView,
  ScrollView,
} from "react-native";

type Language = "en" | "fr";

// Mock data for the reading stats
const mockStats = {
  en: {
    thisWeek: 12,
    lastWeek: 8,
    title: "Reading Stats",
    subtitle: "Articles read per week",
  },
  fr: {
    thisWeek: 12,
    lastWeek: 8,
    title: "Statistiques de lecture",
    subtitle: "Articles lus par semaine",
  },
};

export function SettingsScreen() {
  const [selectedLanguage, setSelectedLanguage] = useState<Language>("en");

  const toggleLanguage = () => {
    setSelectedLanguage((prev) => (prev === "en" ? "fr" : "en"));
  };

  const handleReset = () => {
    Alert.alert(
      selectedLanguage === "en" ? "Reset Everything" : "Réinitialiser tout",
      selectedLanguage === "en"
        ? "Are you sure? This action cannot be undone."
        : "Êtes-vous sûr ? Cette action ne peut pas être annulée.",
      [
        {
          text: selectedLanguage === "en" ? "Cancel" : "Annuler",
          style: "cancel",
        },
        {
          text: selectedLanguage === "en" ? "Reset" : "Réinitialiser",
          style: "destructive",
          onPress: () => {
            // Add your reset logic here
            setSelectedLanguage("en");
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {selectedLanguage === "en" ? "Settings" : "Paramètres"}
        </Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {selectedLanguage === "en"
              ? "Language Settings"
              : "Paramètres de langue"}
          </Text>

          <View style={styles.languageContainer}>
            <Text style={styles.label}>
              {selectedLanguage === "en"
                ? "Current Language:"
                : "Langue actuelle:"}
            </Text>

            <TouchableOpacity
              style={styles.languageButton}
              onPress={toggleLanguage}
            >
              <Text style={styles.buttonText}>
                {selectedLanguage === "en" ? "English" : "Français"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {selectedLanguage === "en"
              ? mockStats.en.title
              : mockStats.fr.title}
          </Text>

          <View style={styles.statsContainer}>
            <Text style={styles.statsSubtitle}>
              {selectedLanguage === "en"
                ? mockStats.en.subtitle
                : mockStats.fr.subtitle}
            </Text>

            <View style={styles.graphContainer}>
              <View style={styles.barGroup}>
                <View
                  style={[
                    styles.bar,
                    { height: mockStats[selectedLanguage].lastWeek * 10 },
                  ]}
                />
                <Text style={styles.barLabel}>
                  {selectedLanguage === "en" ? "Last Week" : "Sem. dernière"}
                </Text>
                <Text style={styles.barValue}>
                  {mockStats[selectedLanguage].lastWeek}
                </Text>
              </View>

              <View style={styles.barGroup}>
                <View
                  style={[
                    styles.bar,
                    { height: mockStats[selectedLanguage].thisWeek * 10 },
                  ]}
                />
                <Text style={styles.barLabel}>
                  {selectedLanguage === "en" ? "This Week" : "Cette sem."}
                </Text>
                <Text style={styles.barValue}>
                  {mockStats[selectedLanguage].thisWeek}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.dangerZone}>
          <Text style={styles.dangerTitle}>
            {selectedLanguage === "en" ? "Danger Zone" : "Zone dangereuse"}
          </Text>
          <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
            <Text style={styles.resetButtonText}>
              {selectedLanguage === "en"
                ? "Reset Everything"
                : "Réinitialiser tout"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.devNotesContainer}>
          <Text style={styles.devNotesTitle}>
            {selectedLanguage === "en"
              ? "Developer Notes"
              : "Notes du développeur"}
          </Text>
          <Text style={styles.devNotesText}>
            {selectedLanguage === "en"
              ? "I created this app to help people stay informed about the latest news while encouraging critical thinking through interactive questions. My goal is to promote media literacy and thoughtful engagement with current events."
              : "J'ai créé cette application pour aider les gens à rester informés des dernières actualités tout en encourageant la pensée critique à travers des questions interactives. Mon objectif est de promouvoir l'éducation aux médias et l'engagement réfléchi avec l'actualité."}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
  },
  languageContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f5f5f5",
    padding: 16,
    borderRadius: 8,
  },
  label: {
    fontSize: 16,
  },
  languageButton: {
    backgroundColor: "black",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
  dangerZone: {
    marginTop: 32,
    padding: 16,
    borderRadius: 8,
    backgroundColor: "#FFF1F0",
    borderWidth: 1,
    borderColor: "#FFE4E6",
  },
  dangerTitle: {
    color: "black",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  resetButton: {
    backgroundColor: "black",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: "center",
  },
  resetButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
  devNotesContainer: {
    marginTop: 32,
    padding: 16,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
  },
  devNotesTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    color: "black",
  },
  devNotesText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#374151",
  },
  statsContainer: {
    backgroundColor: "#f5f5f5",
    padding: 16,
    borderRadius: 8,
  },
  statsSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
  },
  graphContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
    height: 160,
    paddingVertical: 20,
  },
  barGroup: {
    alignItems: "center",
    width: 60,
  },
  bar: {
    width: 40,
    backgroundColor: "black",
    borderRadius: 4,
  },
  barLabel: {
    marginTop: 8,
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  barValue: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: "600",
    color: "black",
  },
  header: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "black",
    textAlign: "center",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
});
