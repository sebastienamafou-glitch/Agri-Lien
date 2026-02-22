"use client";

import { Page, Text, View, Document, StyleSheet, Image, Font } from "@react-pdf/renderer";

// Styles spécifiques au moteur PDF (ce n'est pas du CSS web classique)
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    padding: 0,
  },
  cardContainer: {
    width: "85.6mm", // Format Carte Bancaire (CR80)
    height: "53.98mm",
    border: "1px solid #E5E7EB",
    borderRadius: 8,
    overflow: "hidden",
    position: "relative",
  },
  header: {
    height: "15mm",
    backgroundColor: "#009A44", // Vert Agri-Lien
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    justifyContent: "space-between",
  },
  headerText: {
    color: "white",
    fontSize: 10,
    fontWeight: "heavy", // "bold" n'est pas toujours supporté par défaut
    textTransform: "uppercase",
  },
  subHeaderText: {
    color: "#e2e8f0", // Gris clair
    fontSize: 6,
  },
  body: {
    padding: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  infoCol: {
    flexDirection: "column",
    width: "65%",
  },
  label: {
    fontSize: 6,
    color: "#64748B",
    marginTop: 4,
    textTransform: "uppercase",
  },
  value: {
    fontSize: 9,
    color: "#0F172A",
    fontWeight: "bold",
  },
  qrCol: {
    width: "30%",
    alignItems: "center",
    justifyContent: "center",
  },
  qrCode: {
    width: 50,
    height: 50,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "6mm",
    backgroundColor: "#FF8200", // Orange
    alignItems: "center",
    justifyContent: "center",
  },
  footerText: {
    color: "white",
    fontSize: 5,
    textTransform: "uppercase",
  }
});

type ProducerCardProps = {
  producer: {
    firstName: string;
    lastName: string;
    id: string;
    phoneNumber: string;
    createdAt: Date;
  };
  qrCodeDataUrl: string;
};

export const ProducerIdCard = ({ producer, qrCodeDataUrl }: ProducerCardProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={{ padding: 20 }}>
        <Text style={{ fontSize: 12, marginBottom: 10, color: "#94a3b8" }}>
          À découper selon les pointillés ci-dessous :
        </Text>
        
        {/* LA CARTE */}
        <View style={styles.cardContainer}>
          
          {/* Bandeau Vert */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerText}>Agri-Lien CI</Text>
              <Text style={styles.subHeaderText}>Carte Producteur Certifié</Text>
            </View>
            <Text style={{ color: "white", fontSize: 14 }}>🇨🇮</Text>
          </View>

          {/* Corps Blanc */}
          <View style={styles.body}>
            <View style={styles.infoCol}>
              <Text style={styles.label}>Nom & Prénoms</Text>
              <Text style={styles.value}>{producer.lastName} {producer.firstName}</Text>

              <Text style={styles.label}>ID Unique (UUID)</Text>
              <Text style={{ fontSize: 6, color: "#334155", fontFamily: "Courier" }}>
                {producer.id}
              </Text>

              <Text style={styles.label}>Téléphone</Text>
              <Text style={styles.value}>{producer.phoneNumber}</Text>
            </View>

            <View style={styles.qrCol}>
              {qrCodeDataUrl && <Image src={qrCodeDataUrl} style={styles.qrCode} />}
            </View>
          </View>

          {/* Pied de page Orange */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Délivré le {new Date().toLocaleDateString('fr-CI')} • Valide pour la campagne 2026
            </Text>
          </View>
        </View>

      </View>
    </Page>
  </Document>
);
