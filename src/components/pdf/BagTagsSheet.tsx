"use client";

import { Page, Text, View, Document, StyleSheet, Image } from "@react-pdf/renderer";

// Styles pour l'impression (inchangés)
const styles = StyleSheet.create({
  page: { flexDirection: "row", flexWrap: "wrap", padding: 10 },
  tag: {
    width: "45%", // 2 étiquettes par ligne
    height: "140px",
    margin: "2.5%",
    border: "2px dashed #000", // Pointillés pour la découpe
    padding: 10,
    display: "flex",
    flexDirection: "row",
  },
  info: { width: "70%", fontSize: 10 },
  qr: { width: "30%" },
  header: { fontSize: 12, marginBottom: 5 }, 
  row: { fontSize: 8, marginBottom: 3, color: "#000" }, // Noir pur
  bigId: { fontSize: 10, fontFamily: "Courier", marginTop: 5, fontWeight: "bold" }
});

type Props = {
  bags: any[];
  producerName: string;
  qrDataUrls: Record<string, string>;
};

export const BagTagsSheet = ({ bags, producerName, qrDataUrls }: Props) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {bags.map((bag) => (
        <View key={bag.id} style={styles.tag}>
           <View style={styles.info}>
              <Text style={styles.header}>AGRI-LIEN CI</Text>
              
              <Text style={styles.row}>Prod: {producerName}</Text>
              {/* ✅ CORRECTION : Utilisation de la nouvelle nomenclature (quantité + unité dynamique) */}
              <Text style={styles.row}>Vol: {bag.quantity} {bag.unit}</Text>
              <Text style={styles.row}>Date: {new Date().toLocaleDateString('fr-FR')}</Text>
              <Text style={styles.bigId}>{bag.qrCode}</Text>
           </View>
           <View style={styles.qr}>
              {qrDataUrls[bag.id] && <Image src={qrDataUrls[bag.id]} />}
           </View>
        </View>
      ))}
    </Page>
  </Document>
);
