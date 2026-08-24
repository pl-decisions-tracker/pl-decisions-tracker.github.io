export interface DimFieldConfig {
  /** Field name in generated JSON rows */
  field: string;
  /** Column / group title shown in UI */
  title: string;
}

export interface TableConfig {
  /** URL segment and data directory name */
  key: string;
  /** Text shown above the table */
  description: string;
  /** Hierarchy levels below the date column, in grouping order */
  dims: DimFieldConfig[];
}

const YEARLY_NOTE =
  "Данное количество считается от начала года и сбрасывается 1 января.";

export const TABLE_CONFIGS: Record<string, TableConfig> = {
  applications: {
    key: "applications",
    description: `Количество заявлений, поданных на определённую дату. ${YEARLY_NOTE}`,
    dims: [
      { field: "institution", title: "Институция" },
      { field: "caseType", title: "Тип дела" },
    ],
  },
  decisions: {
    key: "decisions",
    description: `Количество решений, вынесенных на определённую дату. ${YEARLY_NOTE}`,
    dims: [
      { field: "institution", title: "Институция" },
      { field: "caseType", title: "Тип дела" },
      { field: "decision", title: "Решение" },
    ],
  },
  statuses: {
    key: "statuses",
    description: `Количество дел в определённом статусе на определённую дату. ${YEARLY_NOTE}`,
    dims: [
      { field: "institution", title: "Институция" },
      { field: "status", title: "Статус" },
    ],
  },
  applicationstotal: {
    key: "applicationstotal",
    description: `Суммарное количество заявлений по типам дел. ${YEARLY_NOTE}`,
    dims: [{ field: "caseType", title: "Тип дела" }],
  },
  decisionstotal: {
    key: "decisionstotal",
    description: `Суммарное количество решений по типам дел. ${YEARLY_NOTE}`,
    dims: [
      { field: "caseType", title: "Тип дела" },
      { field: "decision", title: "Решение" },
    ],
  },
  statusestotal: {
    key: "statusestotal",
    description: `Суммарное количество дел по статусам. ${YEARLY_NOTE}`,
    dims: [{ field: "status", title: "Статус" }],
  },
};
