import type { caseType, decisionMarker, institution, statuslist, updates } from "@prisma/client";

export interface ContainerRecord {
  total: number;
  count: number;
  field: string;
  children?: FinalDataType;
}
export interface FinalDataType {
  [key: string]: ContainerRecord;
}

export type FormatterFunction = (input: unknown) => string;

export interface MetadataFieldType {
  title: string;
  valueTitle: string;
  maxWidth: number;
  valueMaxWidth: number;
  values: string[];
  resolver: string;
  formatter?: FormatterFunction;
}
export interface FilterType {
  type: "search" | "drop";
}
export interface FinalMetadataType {
  dataName: string;
  filters: {
    [key: string]: FilterType
  };
  fields: {
    [key: string]: MetadataFieldType
  },
  fieldOrder: string[];
}
export interface FinalObjectType {
  data: FinalDataType;
  metadata: FinalMetadataType;
}

export interface FieldProperties {
  name: string;
  total: number;
}

export interface CurrentOjbectType {
  [key: string]: FieldProperties;
}

export interface RawDataType {
  id: number;
  dateId: number;
  institution: number;
  country: number;
  caseType?: number;
  count: number;
  decisionMarker?: number;
  status?: number;
  updateObj: updates;
  caseTypeObj?: caseType;
  institutionObj?: institution;
  statusObj?: statuslist;
  decisionMarkerObj?: decisionMarker;
}

export interface ChartDataSetsDto {
  data: number[];
  label: string;
  borderColor: string;
  backgroundColor: string;
}
export interface ChartDataDto {
  labels: number[];
  datasets: ChartDataSetsDto[];
}

export interface CaseTypeChartType {
  chartData: ChartDataDto;
  institutions: { [key: string]: { chartData: ChartDataDto } };
}

export interface YearOverviewType {
  // Case Type record
  [key: string]: CaseTypeChartType;
}