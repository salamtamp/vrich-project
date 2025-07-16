/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { useState } from 'react';

import type { Dayjs } from 'dayjs';
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react';

import { MONTHS, MONTHS_SHORT, WEEK_DAYS } from '@/constants/data-time';
import dayjs from '@/lib/dayjs';

type DatePickerState = {
  startDate: Dayjs | null;
  endDate: Dayjs | null;
  isSelectingEnd: boolean;
};

type DatePickerProps = {
  minDate?: Dayjs;
  maxDate?: Dayjs;
  defaultStartDate?: Dayjs;
  defaultEndDate?: Dayjs;
  onChange?: (startDate: Dayjs | null, endDate: Dayjs | null) => void;
  onConfirm?: (startDate: Dayjs | null, endDate: Dayjs | null) => void;
};

const isSameDay = (date1: Dayjs | null, date2: Dayjs | null): boolean => {
  if (!date1 || !date2) {
    return false;
  }
  return date1.isSame(date2, 'day');
};

const formatDate = (date: Dayjs | null): string => {
  if (!date) {
    return '';
  }
  const day = date.date();
  const month = MONTHS_SHORT[date.month()];
  const year = date.year();
  return `${day} ${month} ${year}`;
};

const calculateDaysDifference = (start: Dayjs, end: Dayjs): number => {
  return end.diff(start, 'day') + 1;
};

const getDaysInMonth = (date: Dayjs): (Dayjs | null)[] => {
  const firstDay = date.startOf('month');
  const lastDay = date.endOf('month');
  const daysInMonth = lastDay.date();
  const startingDayOfWeek = firstDay.day();

  const days: (Dayjs | null)[] = [];

  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    days.push(date.date(day));
  }

  return days;
};

type MonthDropdownProps = {
  currentMonth: Dayjs;
  showDropdown: boolean;
  onToggle: () => void;
  onMonthChange: (monthIndex: number) => void;
  isMonthDisabled: (monthIndex: number) => boolean;
};

const MonthDropdown: React.FC<MonthDropdownProps> = ({
  currentMonth,
  showDropdown,
  onToggle,
  onMonthChange,
  isMonthDisabled,
}) => (
  <div className='relative'>
    <button
      aria-label='select-mount'
      className='flex items-center gap-1 rounded-lg border border-solid border-gray-200 px-2 py-1 text-sm font-medium transition-colors hover:bg-gray-100'
      type='button'
      onClick={onToggle}
    >
      {MONTHS[currentMonth.month()]}
    </button>
    {showDropdown ? (
      <div className='absolute left-0 top-full z-10 mt-1 max-h-48 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg'>
        {MONTHS.map((month, index) => {
          const disabled = isMonthDisabled(index);
          const isSelected = index === currentMonth.month();
          const bgClass = isSelected ? 'bg-blue-50 text-blue-600' : '';
          return (
            <button
              key={`month-date-picker-${crypto.randomUUID()}`}
              disabled={disabled}
              type='button'
              className={`w-full px-3 py-2 text-left text-sm transition-colors ${
                disabled ? 'cursor-not-allowed bg-gray-50 text-gray-300' : `hover:bg-gray-100 ${bgClass}`
              }`}
              onClick={() => {
                onMonthChange(index);
              }}
            >
              {month}
            </button>
          );
        })}
      </div>
    ) : null}
  </div>
);

type YearDropdownProps = {
  currentMonth: Dayjs;
  showDropdown: boolean;
  onToggle: () => void;
  onYearChange: (year: number) => void;
  getYearOptions: () => number[];
  isYearDisabled: (year: number) => boolean;
};

const YearDropdown: React.FC<YearDropdownProps> = ({
  currentMonth,
  showDropdown,
  onToggle,
  onYearChange,
  getYearOptions,
  isYearDisabled,
}) => (
  <div className='relative'>
    <button
      aria-label='select-year'
      className='flex items-center gap-1 rounded-lg border border-solid border-gray-100 px-2 py-1 text-sm font-medium transition-colors hover:bg-gray-100'
      type='button'
      onClick={onToggle}
    >
      {currentMonth.year()}
    </button>
    {showDropdown ? (
      <div className='absolute left-0 top-full z-10 mt-1 max-h-48 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg'>
        {getYearOptions().map((year) => {
          const disabled = isYearDisabled(year);
          const isSelected = year === currentMonth.year();
          const bgClass = isSelected ? 'bg-blue-50 text-blue-600' : '';
          return (
            <button
              key={year}
              disabled={disabled}
              type='button'
              className={`w-full px-3 py-2 text-left text-sm transition-colors ${
                disabled ? 'cursor-not-allowed bg-gray-50 text-gray-300' : `hover:bg-gray-100 ${bgClass}`
              }`}
              onClick={() => {
                onYearChange(year);
              }}
            >
              {year}
            </button>
          );
        })}
      </div>
    ) : null}
  </div>
);

type CalendarHeaderProps = {
  currentMonth: Dayjs;
  minDate?: Dayjs;
  maxDate?: Dayjs;
  showMonthDropdown: boolean;
  showYearDropdown: boolean;
  onMonthDropdownToggle: () => void;
  onYearDropdownToggle: () => void;
  onMonthChange: (monthIndex: number) => void;
  onYearChange: (year: number) => void;
  onNavigateMonth: (direction: number) => void;
  isMonthDisabled: (monthIndex: number) => boolean;
  isYearDisabled: (year: number) => boolean;
  getYearOptions: () => number[];
  isSingleYearRange?: boolean;
};

const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  currentMonth,
  minDate,
  maxDate,
  showMonthDropdown,
  showYearDropdown,
  onMonthDropdownToggle,
  onYearDropdownToggle,
  onMonthChange,
  onYearChange,
  onNavigateMonth,
  isMonthDisabled,
  isYearDisabled,
  getYearOptions,
  isSingleYearRange,
}) => {
  const isPrevDisabled = minDate
    ? currentMonth.subtract(1, 'month').endOf('month').isBefore(minDate, 'day')
    : false;
  const isNextDisabled = maxDate
    ? currentMonth.add(1, 'month').startOf('month').isAfter(maxDate, 'day')
    : false;

  return (
    <div className='mb-4 flex items-center justify-between'>
      <button
        aria-label='เดือนก่อนหน้า'
        className={`rounded p-1 ${isPrevDisabled ? 'cursor-not-allowed text-gray-300' : 'hover:bg-gray-100'}`}
        disabled={isPrevDisabled}
        type='button'
        onClick={() => {
          onNavigateMonth(-1);
        }}
      >
        <ChevronLeft className='size-4' />
      </button>

      <div className='flex items-center space-x-2'>
        <MonthDropdown
          currentMonth={currentMonth}
          isMonthDisabled={isMonthDisabled}
          showDropdown={showMonthDropdown}
          onMonthChange={onMonthChange}
          onToggle={onMonthDropdownToggle}
        />
        {!isSingleYearRange && (
          <YearDropdown
            currentMonth={currentMonth}
            getYearOptions={getYearOptions}
            isYearDisabled={isYearDisabled}
            showDropdown={showYearDropdown}
            onToggle={onYearDropdownToggle}
            onYearChange={onYearChange}
          />
        )}
      </div>

      <button
        aria-label='เดือนถัดไป'
        className={`rounded p-1 ${isNextDisabled ? 'cursor-not-allowed text-gray-300' : 'hover:bg-gray-100'}`}
        disabled={isNextDisabled}
        type='button'
        onClick={() => {
          onNavigateMonth(1);
        }}
      >
        <ChevronRight className='size-4' />
      </button>
    </div>
  );
};

type CalendarDayProps = {
  date: Dayjs;
  isStart: boolean;
  isEnd: boolean;
  isToday: boolean;
  inRange: boolean;
  inHoverRange: boolean;
  disabled: boolean;
  onDateClick: (date: Dayjs) => void;
  onDateHover: (date: Dayjs) => void;
  onDateLeave: () => void;
};

const CalendarDay: React.FC<CalendarDayProps> = ({
  date,
  isStart,
  isEnd,
  isToday,
  inRange,
  inHoverRange,
  disabled,
  onDateClick,
  onDateHover,
  onDateLeave,
}) => {
  const getButtonClassName = (): string => {
    let className = 'relative h-8 rounded text-xs transition-colors ';

    if (disabled) {
      className += 'cursor-not-allowed text-gray-300 bg-gray-50';
    } else if (isStart || isEnd) {
      className += 'bg-blue-500 text-white hover:bg-blue-600';
    } else if (inRange) {
      className += 'bg-blue-100 text-blue-700 hover:bg-blue-200';
    } else if (inHoverRange) {
      className += 'bg-blue-50 text-blue-600 hover:bg-blue-100';
    } else if (isToday) {
      className += 'bg-gray-200 text-gray-900 hover:bg-gray-300';
    } else {
      className += 'text-gray-700 hover:bg-gray-100';
    }

    return className;
  };

  return (
    <button
      aria-label={`${date.format('D MMMM YYYY')}`}
      className={getButtonClassName()}
      disabled={disabled}
      type='button'
      onMouseLeave={onDateLeave}
      onClick={() => {
        onDateClick(date);
      }}
      onMouseEnter={() => {
        onDateHover(date);
      }}
    >
      {date.date()}
      {isToday && !isStart && !isEnd ? (
        <div className='absolute bottom-0 left-1/2 size-1 -translate-x-1/2 transform rounded-full bg-blue-500' />
      ) : null}
    </button>
  );
};

type CalendarGridProps = {
  days: (Dayjs | null)[];
  selectedStartDate: Dayjs | null;
  selectedEndDate: Dayjs | null;
  hoveredDate: Dayjs | null;
  isSelectingEnd: boolean;
  onDateClick: (date: Dayjs) => void;
  onDateHover: (date: Dayjs) => void;
  onDateLeave: () => void;
  isDateDisabled: (date: Dayjs) => boolean;
};

const CalendarGrid: React.FC<CalendarGridProps> = ({
  days,
  selectedStartDate,
  selectedEndDate,
  hoveredDate,
  isSelectingEnd,
  onDateClick,
  onDateHover,
  onDateLeave,
  isDateDisabled,
}) => {
  const isInRange = (date: Dayjs | null): boolean => {
    if (!selectedStartDate || !selectedEndDate || !date) {
      return false;
    }
    return date.isAfter(selectedStartDate, 'day') && date.isBefore(selectedEndDate, 'day');
  };

  const isInHoverRange = (date: Dayjs | null): boolean => {
    if (!selectedStartDate || !hoveredDate || !date || !isSelectingEnd) {
      return false;
    }
    return date.isAfter(selectedStartDate, 'day') && date.isBefore(hoveredDate, 'day');
  };

  const isRangeStart = (date: Dayjs | null): boolean => {
    return selectedStartDate !== null && isSameDay(date, selectedStartDate);
  };

  const isRangeEnd = (date: Dayjs | null): boolean => {
    return selectedEndDate !== null && isSameDay(date, selectedEndDate);
  };

  return (
    <div className='grid grid-cols-7 gap-1'>
      {WEEK_DAYS.map((day) => (
        <div
          key={day}
          className='py-2 text-center text-xs text-gray-500'
        >
          {day}
        </div>
      ))}
      {days.map((date) => {
        if (!date) {
          return (
            <div
              key={`empty-date-picker-${crypto.randomUUID()}`}
              className='h-8'
            />
          );
        }

        const isStart = isRangeStart(date);
        const isEnd = isRangeEnd(date);
        const isToday = isSameDay(date, dayjs());
        const inRange = isInRange(date);
        const inHoverRange = isInHoverRange(date);
        const disabled = isDateDisabled(date);

        return (
          <CalendarDay
            key={`day-${date.format('YYYY-MM-DD')}`}
            date={date}
            disabled={disabled}
            inHoverRange={inHoverRange}
            inRange={inRange}
            isEnd={isEnd}
            isStart={isStart}
            isToday={isToday}
            onDateClick={onDateClick}
            onDateHover={onDateHover}
            onDateLeave={onDateLeave}
          />
        );
      })}
    </div>
  );
};

type StatusDisplayProps = {
  selectedStartDate: Dayjs | null;
  selectedEndDate: Dayjs | null;
  hoveredDate: Dayjs | null;
  isSelectingEnd: boolean;
};

const StatusDisplay: React.FC<StatusDisplayProps> = ({
  selectedStartDate,
  selectedEndDate,
  hoveredDate,
  isSelectingEnd,
}) => {
  const getStatusText = (): string => {
    if (isSelectingEnd && selectedStartDate) {
      if (hoveredDate) {
        const dayCount = calculateDaysDifference(selectedStartDate, hoveredDate);
        return `${dayCount} days (preview)`;
      }
      return 'Select end date';
    }

    if (!selectedStartDate) {
      return 'Select start date';
    }

    if (selectedStartDate && selectedEndDate) {
      const dayCount = calculateDaysDifference(selectedStartDate, selectedEndDate);
      return `Selected ${dayCount} days`;
    }

    return 'Select end date';
  };
  return <div className='mt-4 text-center text-xs text-gray-500'>{getStatusText()}</div>;
};

type CalendarFooterProps = {
  selectedStartDate: Dayjs | null;
  selectedEndDate: Dayjs | null;
  onCancel: () => void;
  onApply: () => void;
};

const CalendarFooter: React.FC<CalendarFooterProps> = ({
  selectedStartDate,
  selectedEndDate,
  onCancel,
  onApply,
}) => {
  const getApplyButtonClassName = (): string => {
    const isDisabled = !selectedStartDate || !selectedEndDate;
    return `rounded px-3 py-1 text-xs transition-colors ${
      isDisabled ? 'cursor-not-allowed bg-gray-200 text-gray-400' : 'bg-blue-500 text-white hover:bg-blue-600'
    }`;
  };

  return (
    <div className='mt-4 flex justify-end space-x-2 border-t pt-4'>
      <button
        className='px-3 py-1 text-xs text-gray-600 transition-colors hover:text-gray-800'
        type='button'
        onClick={onCancel}
      >
        Cancel
      </button>
      <button
        className={getApplyButtonClassName()}
        disabled={!selectedStartDate || !selectedEndDate}
        type='button'
        onClick={onApply}
      >
        Apply
      </button>
    </div>
  );
};

type DatePickerDialogProps = {
  isOpen: boolean;
  currentMonth: Dayjs;
  selectedStartDate: Dayjs | null;
  selectedEndDate: Dayjs | null;
  hoveredDate: Dayjs | null;
  isSelectingEnd: boolean;
  showYearDropdown: boolean;
  showMonthDropdown: boolean;
  minDate?: Dayjs;
  maxDate?: Dayjs;
  onDateClick: (date: Dayjs) => void;
  onDateHover: (date: Dayjs) => void;
  onDateLeave: () => void;
  onMonthChange: (monthIndex: number) => void;
  onYearChange: (year: number) => void;
  onNavigateMonth: (direction: number) => void;
  onCancel: () => void;
  onApply: () => void;
  onCalendarKeyDown: (e: React.KeyboardEvent) => void;
  onMonthDropdownToggle: () => void;
  onYearDropdownToggle: () => void;
  isDateDisabled: (date: Dayjs) => boolean;
  isMonthDisabled: (monthIndex: number) => boolean;
  isYearDisabled: (year: number) => boolean;
  getYearOptions: () => number[];
  setShowYearDropdown: (show: boolean) => void;
  setShowMonthDropdown: (show: boolean) => void;
  isSingleYearRange?: boolean;
};

const DatePickerDialog: React.FC<DatePickerDialogProps> = ({
  isOpen,
  currentMonth,
  selectedStartDate,
  selectedEndDate,
  hoveredDate,
  isSelectingEnd,
  showYearDropdown,
  showMonthDropdown,
  minDate,
  maxDate,
  onDateClick,
  onDateHover,
  onDateLeave,
  onMonthChange,
  onYearChange,
  onNavigateMonth,
  onCancel,
  onApply,
  onCalendarKeyDown,
  onMonthDropdownToggle,
  onYearDropdownToggle,
  isDateDisabled,
  isMonthDisabled,
  isYearDisabled,
  getYearOptions,
  setShowYearDropdown,
  setShowMonthDropdown,
  isSingleYearRange,
}) => {
  if (!isOpen) {
    return null;
  }

  const days = getDaysInMonth(currentMonth);

  return (
    <dialog
      open
      aria-label='date-picker-calendar'
      className='absolute inset-x-0 top-12 z-50 w-[260px] rounded-lg border border-gray-200 bg-white p-4 shadow-lg'
      onKeyDown={onCalendarKeyDown}
      onClick={(e) => {
        if (!(e.target as Element).closest('.relative')) {
          setShowYearDropdown(false);
          setShowMonthDropdown(false);
        }
      }}
    >
      <CalendarHeader
        currentMonth={currentMonth}
        getYearOptions={getYearOptions}
        isMonthDisabled={isMonthDisabled}
        isSingleYearRange={isSingleYearRange}
        isYearDisabled={isYearDisabled}
        maxDate={maxDate}
        minDate={minDate}
        showMonthDropdown={showMonthDropdown}
        showYearDropdown={showYearDropdown ? !isSingleYearRange : false}
        onMonthChange={onMonthChange}
        onMonthDropdownToggle={onMonthDropdownToggle}
        onNavigateMonth={onNavigateMonth}
        onYearChange={onYearChange}
        onYearDropdownToggle={onYearDropdownToggle}
      />

      <CalendarGrid
        days={days}
        hoveredDate={hoveredDate}
        isDateDisabled={isDateDisabled}
        isSelectingEnd={isSelectingEnd}
        selectedEndDate={selectedEndDate}
        selectedStartDate={selectedStartDate}
        onDateClick={onDateClick}
        onDateHover={onDateHover}
        onDateLeave={onDateLeave}
      />

      <StatusDisplay
        hoveredDate={hoveredDate}
        isSelectingEnd={isSelectingEnd}
        selectedEndDate={selectedEndDate}
        selectedStartDate={selectedStartDate}
      />

      <CalendarFooter
        selectedEndDate={selectedEndDate}
        selectedStartDate={selectedStartDate}
        onApply={onApply}
        onCancel={onCancel}
      />
    </dialog>
  );
};

const DatePicker: React.FC<DatePickerProps> = ({
  minDate,
  maxDate,
  defaultStartDate,
  defaultEndDate,
  onChange,
  onConfirm,
}) => {
  const [selectedStartDate, setSelectedStartDate] = useState<Dayjs | null>(defaultStartDate ?? null);
  const [selectedEndDate, setSelectedEndDate] = useState<Dayjs | null>(defaultEndDate ?? null);
  const [currentMonth, setCurrentMonth] = useState<Dayjs>(defaultStartDate ?? dayjs());
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isSelectingEnd, setIsSelectingEnd] = useState<boolean>(
    defaultStartDate !== null && defaultEndDate === null
  );
  const [hoveredDate, setHoveredDate] = useState<Dayjs | null>(null);
  const [showYearDropdown, setShowYearDropdown] = useState<boolean>(false);
  const [showMonthDropdown, setShowMonthDropdown] = useState<boolean>(false);
  const [previousState, setPreviousState] = useState<DatePickerState | null>(null);

  const isSingleYearRange = minDate && maxDate && minDate.year() === maxDate.year();

  const isDateDisabled = (date: Dayjs): boolean => {
    if (minDate && date.isBefore(minDate, 'day')) {
      return true;
    }
    if (maxDate && date.isAfter(maxDate, 'day')) {
      return true;
    }
    if (isSelectingEnd && selectedStartDate && date.isBefore(selectedStartDate, 'day')) {
      return true;
    }
    return false;
  };

  const isMonthDisabled = (monthIndex: number): boolean => {
    const testDate = currentMonth.month(monthIndex);
    const startOfMonth = testDate.startOf('month');
    const endOfMonth = testDate.endOf('month');

    if (minDate && endOfMonth.isBefore(minDate, 'day')) {
      return true;
    }
    if (maxDate && startOfMonth.isAfter(maxDate, 'day')) {
      return true;
    }
    if (isSelectingEnd && selectedStartDate && endOfMonth.isBefore(selectedStartDate, 'day')) {
      return true;
    }
    return false;
  };

  const isYearDisabled = (year: number): boolean => {
    const testDate = dayjs().year(year);
    const startOfYear = testDate.startOf('year');
    const endOfYear = testDate.endOf('year');

    if (minDate && endOfYear.isBefore(minDate, 'day')) {
      return true;
    }
    if (maxDate && startOfYear.isAfter(maxDate, 'day')) {
      return true;
    }
    if (isSelectingEnd && selectedStartDate && endOfYear.isBefore(selectedStartDate, 'day')) {
      return true;
    }
    return false;
  };

  const getYearOptions = (): number[] => {
    const currentYear = dayjs().year();
    const years: number[] = [];
    let endYear = currentYear + 10;
    let startYear = currentYear - 10;

    if (maxDate) {
      endYear = Math.min(endYear, maxDate.year());
    }
    if (minDate) {
      startYear = Math.max(startYear, minDate.year());
    }
    if (startYear > endYear) {
      startYear = endYear;
    }

    for (let year = startYear; year <= endYear; year++) {
      years.push(year);
    }
    return years.reverse();
  };

  const handleStartDateSelection = (date: Dayjs): void => {
    setSelectedStartDate(date);
    setSelectedEndDate(null);
    setIsSelectingEnd(true);
    onChange?.(date, null);
  };

  const handleEndDateSelection = (date: Dayjs): void => {
    const isValidEndDate = date.isAfter(selectedStartDate, 'day') || date.isSame(selectedStartDate, 'day');

    if (isValidEndDate) {
      setSelectedEndDate(date);
      setIsSelectingEnd(false);
      setHoveredDate(null);
      onChange?.(selectedStartDate, date);
    } else {
      setSelectedStartDate(date);
      setSelectedEndDate(null);
      setIsSelectingEnd(true);
      onChange?.(date, null);
    }
  };

  const handleDateClick = (date: Dayjs): void => {
    if (isDateDisabled(date)) {
      return;
    }

    if (!selectedStartDate) {
      handleStartDateSelection(date);
      return;
    }

    if (isSelectingEnd) {
      handleEndDateSelection(date);
      return;
    }

    handleStartDateSelection(date);
  };

  const handleDateHover = (date: Dayjs): void => {
    if (isDateDisabled(date)) {
      return;
    }

    if (
      isSelectingEnd &&
      selectedStartDate &&
      (date.isAfter(selectedStartDate, 'day') || date.isSame(selectedStartDate, 'day'))
    ) {
      setHoveredDate(date);
    }
  };

  const handleDateLeave = (): void => {
    setHoveredDate(null);
  };

  const handleYearChange = (year: number): void => {
    if (isYearDisabled(year)) {
      return;
    }
    const newDate = currentMonth.year(year);
    setCurrentMonth(newDate);
    setShowYearDropdown(false);
  };

  const handleMonthChange = (monthIndex: number): void => {
    if (isMonthDisabled(monthIndex)) {
      return;
    }
    const newDate = currentMonth.month(monthIndex);
    setCurrentMonth(newDate);
    setShowMonthDropdown(false);
  };

  const navigateMonth = (direction: number): void => {
    const newMonth = currentMonth.add(direction, 'month');

    if (minDate && newMonth.endOf('month').isBefore(minDate, 'day')) {
      return;
    }
    if (maxDate && newMonth.startOf('month').isAfter(maxDate, 'day')) {
      return;
    }

    setCurrentMonth(newMonth);
  };

  const clearSelection = (): void => {
    setSelectedStartDate(null);
    setSelectedEndDate(null);
    setIsSelectingEnd(false);
    setHoveredDate(null);
    onChange?.(null, null);
  };

  const handleOpen = (): void => {
    setPreviousState({
      startDate: selectedStartDate,
      endDate: selectedEndDate,
      isSelectingEnd,
    });
    setIsOpen(true);
    setCurrentMonth(selectedStartDate ?? dayjs());
  };

  const handleCancel = (): void => {
    if (previousState) {
      setSelectedStartDate(previousState.startDate);
      setSelectedEndDate(previousState.endDate);
      setIsSelectingEnd(previousState.isSelectingEnd);
      onChange?.(previousState.startDate, previousState.endDate);
    }
    setHoveredDate(null);
    setIsOpen(false);
    setShowYearDropdown(false);
    setShowMonthDropdown(false);
  };

  const handleApply = (): void => {
    setPreviousState(null);
    setIsOpen(false);
    setShowYearDropdown(false);
    setShowMonthDropdown(false);
    if (onConfirm) {
      onConfirm(selectedStartDate, selectedEndDate);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleOpen();
    }
  };

  const handleCalendarKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Escape') {
      setShowYearDropdown(false);
      setShowMonthDropdown(false);
    }
  };

  const getDisplayText = (): string => {
    if (selectedStartDate && selectedEndDate) {
      return `${formatDate(selectedStartDate)} - ${formatDate(selectedEndDate)}`;
    }
    if (selectedStartDate) {
      return `${formatDate(selectedStartDate)} - End date`;
    }
    return 'Select date range';
  };

  const handleMonthDropdownToggle = (): void => {
    setShowMonthDropdown(!showMonthDropdown);
    setShowYearDropdown(false);
  };

  const handleYearDropdownToggle = (): void => {
    setShowYearDropdown(!showYearDropdown);
    setShowMonthDropdown(false);
  };

  return (
    <div className='relative w-[220px]'>
      <div
        aria-expanded={isOpen}
        aria-haspopup='true'
        aria-label='select-date-range'
        className='relative w-full cursor-pointer rounded-lg border border-gray-300 bg-white px-3 py-2 text-left transition-colors hover:border-gray-400 focus:outline-none'
        onKeyDown={handleKeyDown}
        onClick={() => {
          if (isOpen) {
            handleCancel();
          } else {
            handleOpen();
          }
        }}
      >
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-2'>
            <Calendar className='size-4 text-gray-400' />
            <span className='text-sm text-gray-700'>{getDisplayText()}</span>
          </div>
          {!isOpen && (selectedStartDate || selectedEndDate) ? (
            <button
              aria-label='clear-selection'
              className='text-gray-400 hover:text-gray-600'
              type='button'
              onClick={(e) => {
                e.stopPropagation();
                clearSelection();
              }}
            >
              <X className='size-4' />
            </button>
          ) : null}
        </div>
      </div>

      <DatePickerDialog
        currentMonth={currentMonth}
        getYearOptions={getYearOptions}
        hoveredDate={hoveredDate}
        isDateDisabled={isDateDisabled}
        isMonthDisabled={isMonthDisabled}
        isOpen={isOpen}
        isSelectingEnd={isSelectingEnd}
        isSingleYearRange={isSingleYearRange}
        isYearDisabled={isYearDisabled}
        maxDate={maxDate}
        minDate={minDate}
        selectedEndDate={selectedEndDate}
        selectedStartDate={selectedStartDate}
        setShowMonthDropdown={setShowMonthDropdown}
        setShowYearDropdown={setShowYearDropdown}
        showMonthDropdown={showMonthDropdown}
        showYearDropdown={showYearDropdown}
        onApply={handleApply}
        onCalendarKeyDown={handleCalendarKeyDown}
        onCancel={handleCancel}
        onDateClick={handleDateClick}
        onDateHover={handleDateHover}
        onDateLeave={handleDateLeave}
        onMonthChange={handleMonthChange}
        onMonthDropdownToggle={handleMonthDropdownToggle}
        onNavigateMonth={navigateMonth}
        onYearChange={handleYearChange}
        onYearDropdownToggle={handleYearDropdownToggle}
      />
    </div>
  );
};

export default DatePicker;
