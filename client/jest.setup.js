// Native modules that do not exist in the Jest (Node) environment.
jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn().mockResolvedValue(null),
  setItemAsync: jest.fn().mockResolvedValue(undefined),
  deleteItemAsync: jest.fn().mockResolvedValue(undefined),
}));

// Icon fonts need native asset loading; tests only render logic, not icons.
jest.mock("@expo/vector-icons", () => ({ Ionicons: "Ionicons" }));
