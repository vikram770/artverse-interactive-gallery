
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface YearFilterProps {
  selectedYear: string | null;
  years: number[];
  onChange: (value: number | null) => void;
}

const YearFilter = ({ selectedYear, years, onChange }: YearFilterProps) => {
  return (
    <div className="w-full md:w-auto">
      <Select
        value={selectedYear?.toString() || "all"}
        onValueChange={(value) => onChange(value === "all" ? null : parseInt(value))}
      >
        <SelectTrigger className="w-full md:w-48">
          <SelectValue placeholder="Year" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Years</SelectItem>
          {years.map(year => (
            <SelectItem key={year} value={year.toString()}>
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default YearFilter;
