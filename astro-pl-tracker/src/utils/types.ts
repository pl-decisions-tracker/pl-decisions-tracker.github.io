// Shared DTOs for the chart-based year overview pages.

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
