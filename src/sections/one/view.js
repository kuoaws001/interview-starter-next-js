'use client';

import { useEffect, useState } from 'react';
import {
  Container, Stack, Box, Typography,
  Select, FormControl, InputLabel, OutlinedInput, MenuItem
} from '@mui/material';

import axios, { endpoints } from 'src/utils/axios';
import { alpha } from '@mui/material/styles';
import { useSettingsContext } from 'src/components/settings';

// ----------------------------------------------------------------------

const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]

export default function OneView() {
  const settings = useSettingsContext();

  const [figures, setFigures] = useState([]);
  const [years, setYears] = useState([]);
  const [form, setForm] = useState({
    f_year: '',
    f_month: '',
    t_year: '',
    t_month: ''
  })
  const [sum, setSum] = useState(0)

  const fetchData = async () => {
    const response = await axios.get(endpoints.financial.figures);
    const { data } = response.data;
    initData(data);
  }

  const initData = (data) => {
    // init figures
    const figures = data.map((x) => {
      const { yearPeriod, monthPeriod, totalAmount } = x.attributes

      return {
        date: new Date(yearPeriod, monthPeriod - 1),
        totalAmount
      }
    })

    // init years
    let years = new Set();
    const origin = data.map((x) => x.attributes.yearPeriod);
    origin.forEach(x => {
      if (!years.has(x)) years.add(x)
    })

    setFigures(figures)
    setYears(Array.from(years))
  }

  useEffect(() => {
    fetchData();
  }, [])

  useEffect(() => {
    const { f_year, f_month, t_year, t_month } = form;
    if (f_year && f_month && t_year && t_month) {
      let f_date = new Date(Number(f_year), Number(f_month) - 1)
      let t_date = new Date(Number(t_year), Number(t_month) - 1)

      if (f_date > t_date) {
        const temp = f_date;
        f_date = t_date;
        t_date = temp;
      }

      const result = figures.reduce((pre, current) => {
        const { date, totalAmount } = current;

        if (f_date <= date && date <= t_date) {
          const temp = (pre + totalAmount).toFixed(2);
          return Number(temp);
        }

        return pre;
      }, 0)

      setSum(result)
    }
  }, [form])

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm({
      ...form,
      [name]: value
    })
  }

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <Typography variant="h4"> Page One </Typography>

      <Box
        sx={{
          mt: 5,
          p: 5,
          width: 1,
          height: 320,
          borderRadius: 2,
          bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04),
          border: (theme) => `dashed 1px ${theme.palette.divider}`,
        }}
      >
        <Stack direction='row' spacing={2} sx={{ mb: 2 }}>
          <Typography sx={{ display: 'flex', alignItems: 'center', width: '30px' }}>From</Typography>

          <DropDown
            label='Year'
            name='f_year'
            value={form.f_year}
            options={years}
            onChange={handleChange}
          />

          <DropDown
            label='Month'
            name='f_month'
            value={form.f_month}
            options={months}
            onChange={handleChange}
          />

        </Stack>

        <Stack direction='row' spacing={2}>
          <Typography sx={{ display: 'flex', alignItems: 'center', width: '30px' }}>To</Typography>

          <DropDown
            label='Year'
            name='t_year'
            value={form.t_year}
            options={years}
            onChange={handleChange}
          />

          <DropDown
            label='Month'
            name='t_month'
            value={form.t_month}
            options={months}
            onChange={handleChange}
          />

        </Stack>

        <Box sx={{ mt: 2 }}>
          {sum > 0 && <Typography>{`Sum: ${sum}`}</Typography>}
        </Box>
      </Box>
    </Container>
  );
}

const DropDown = ({ label, name, value, options, onChange }) => {
  return (
    <FormControl size='small' sx={{ width: '100px' }}>
      <InputLabel >{label}</InputLabel>
      <Select
        name={name}
        value={value}
        onChange={onChange}
        input={<OutlinedInput label={label} />}
        renderValue={(selected) => selected}
      >
        {options.map((option, index) => (
          <MenuItem key={index} value={option}>
            {option}
          </MenuItem>
        ))}

      </Select>
    </FormControl>
  )
}