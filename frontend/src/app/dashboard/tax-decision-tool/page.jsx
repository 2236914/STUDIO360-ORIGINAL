'use client';

import { useState, useEffect } from 'react';
import {
  Typography,
  Card,
  CardContent,
  Box,
  TextField,
  Switch,
  FormControlLabel,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Stack,
} from '@mui/material';
import { DashboardContent } from 'src/layouts/dashboard';
import { Iconify } from 'src/components/iconify';

// Enhanced tax computation logic matching the Excel format
function computeTax(user) {
  const { annualSales, annualExpenses, hasReceipts, isEmployed, annualSalary } = user;

  // Questions logic
  const q1 = annualSales > 3000000; // Lagpas ba sa 3M yung annual sales mo?
  const q2 = hasReceipts; // Nagbibigay ba ng resibo yung mga suppliers mo?
  const q3 = isEmployed; // Employed kaba?
  
  // Tax type determination
  const taxType = q1 ? 'VAT' : 'Non-VAT';
  const deductionType = q2 ? 'Itemized' : 'OSD';
  
  // Computation Variables
  const osdDeduction = annualSales * 0.4;
  const itemizedDeduction = q2 ? annualExpenses : 0;
  const osdTaxableIncome = annualSales - osdDeduction;
  const itemizedTaxableIncome = annualSales - itemizedDeduction;

  // Enhanced Income Tax Table (Philippine tax brackets)
  const computeIncomeTax = (income) => {
    if (income <= 250000) return 0;
    if (income <= 400000) return (income - 250000) * 0.2;
    if (income <= 800000) return 30000 + (income - 400000) * 0.25;
    if (income <= 2000000) return 130000 + (income - 800000) * 0.3;
    if (income <= 8000000) return 490000 + (income - 2000000) * 0.32;
    return 2410000 + (income - 8000000) * 0.35;
  };

  const incomeTaxOSD = computeIncomeTax(osdTaxableIncome);
  const incomeTaxItemized = computeIncomeTax(itemizedTaxableIncome);

  // Percentage Tax (3%) or VAT (12%)
  const percentageTax = q1 ? annualSales * 0.12 : annualSales * 0.03;

  // 8% computation
  const isEligibleFor8 = annualSales <= 3000000 && !q3;
  const taxableFor8 = annualSales - 250000;
  const tax8Percent = isEligibleFor8 ? taxableFor8 * 0.08 : 0;

  // Determine best option and savings
  const options = [
    { name: '8% Option', total: isEligibleFor8 ? tax8Percent : Infinity },
    { name: 'OSD (40%)', total: incomeTaxOSD + percentageTax },
    { name: 'Itemized', total: incomeTaxItemized + percentageTax },
  ];
  
  const bestOption = options.reduce((min, option) => 
    option.total < min.total ? option : min
  );
  
  const worstOption = options.reduce((max, option) => 
    option.total > max.total ? max : option
  );
  
  const taxSavings = worstOption.total - bestOption.total;

  return {
    questions: {
      q1: { question: 'Lagpas ba sa 3M yung annual sales mo?', answer: q1 ? 'Oo' : 'Hindi', taxType: taxType },
      q2: { question: 'Nagbibigay ba ng resibo yung mga suppliers mo?', answer: q2 ? 'Oo' : 'Hindi', taxType: deductionType },
      q3: { question: 'Employed kaba?', answer: q3 ? 'Oo' : 'Hindi', taxType: 'OSD' },
      q4: { question: 'If Oo sa Q3, magkano annual salary mo?', answer: q3 ? annualSalary.toString() : 'N/A' },
      q5: { question: 'Magkano annual sales mo?', answer: annualSales.toString() },
      q6: { question: 'Magkano annual expenses na may valid invoice?', answer: annualExpenses.toString() },
    },
    summary: {
      recommendedTaxType: `${taxType} ${deductionType}`,
      totalAnnualTax: bestOption.total,
      annualTaxSavings: taxSavings,
    },
    computations: {
      sales: annualSales,
      osd: {
        deduction: osdDeduction,
        taxableIncome: osdTaxableIncome,
        incomeTax: incomeTaxOSD,
        percentageTax: percentageTax,
        totalTax: incomeTaxOSD + percentageTax,
      },
      itemized: {
        deduction: itemizedDeduction,
        taxableIncome: itemizedTaxableIncome,
        incomeTax: incomeTaxItemized,
        percentageTax: percentageTax,
        totalTax: incomeTaxItemized + percentageTax,
      },
      eightPercent: {
        deduction: 250000,
        taxableIncome: taxableFor8,
        incomeTax: tax8Percent,
        percentageTax: 0,
        totalTax: tax8Percent,
        eligible: isEligibleFor8,
      },
    },
  };
}

export default function TaxDecisionToolPage() {
  // Set document title
  useEffect(() => {
    document.title = 'Tax Decision Tool | Kitsch Studio';
  }, []);

  // Mock data matching the Excel example
  const mockData = {
    annualSales: '1650000',
    annualExpenses: '50000',
    hasReceipts: false,
    isEmployed: false,
    annualSalary: '160000',
  };

  const [formData, setFormData] = useState(mockData);
  const [results, setResults] = useState(null);

  // Compute tax in real-time whenever form data changes
  useEffect(() => {
    if (formData.annualSales || formData.annualExpenses || formData.annualSalary) {
      const userInput = {
        annualSales: parseFloat(formData.annualSales) || 0,
        annualExpenses: parseFloat(formData.annualExpenses) || 0,
        hasReceipts: formData.hasReceipts,
        isEmployed: formData.isEmployed,
        annualSalary: parseFloat(formData.annualSalary) || 0,
      };
      const taxResults = computeTax(userInput);
      setResults(taxResults);
    }
  }, [formData]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const loadMockData = () => {
    setFormData(mockData);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (amount) => {
    return new Intl.NumberFormat('en-PH').format(amount);
  };

  return (
    <DashboardContent maxWidth="xl">
      {/* Header */}
      <Typography variant="h4" sx={{ mb: 1 }}>
        Tax Decision Tool
      </Typography>
      
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
        Dashboard / Tax Decision Tool
      </Typography>

      {/* Overview Section */}
      <Card sx={{ p: 3, mb: 3, bgcolor: 'primary.lighter' }}>
        <Stack direction="row" alignItems="flex-start" spacing={2}>
          <Iconify icon="eva:info-fill" width={24} sx={{ color: 'primary.main', mt: 0.5 }} />
          <Box>
            <Typography variant="h6" sx={{ mb: 1, color: 'primary.main' }}>
              Smart Tax Decision Making
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Input your business information below to get real-time tax recommendations. 
              The system will automatically calculate and compare different tax options (8%, OSD, Itemized) 
              to help you choose the most tax-efficient option for your business.
            </Typography>
          </Box>
        </Stack>
      </Card>

      {/* Business Information Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 3 }}>
            Business Information
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Annual Sales (₱)"
                type="number"
                value={formData.annualSales}
                onChange={(e) => handleInputChange('annualSales', e.target.value)}
                fullWidth
                InputProps={{
                  startAdornment: <span>₱</span>,
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Annual Expenses with Valid Receipts (₱)"
                type="number"
                value={formData.annualExpenses}
                onChange={(e) => handleInputChange('annualExpenses', e.target.value)}
                fullWidth
                InputProps={{
                  startAdornment: <span>₱</span>,
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.hasReceipts}
                    onChange={(e) => handleInputChange('hasReceipts', e.target.checked)}
                  />
                }
                label="Do your suppliers issue valid receipts?"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isEmployed}
                    onChange={(e) => handleInputChange('isEmployed', e.target.checked)}
                  />
                }
                label="Are you currently employed?"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Annual Salary (₱)"
                type="number"
                value={formData.annualSalary}
                onChange={(e) => handleInputChange('annualSalary', e.target.value)}
                fullWidth
                disabled={!formData.isEmployed}
                InputProps={{
                  startAdornment: <span>₱</span>,
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Button
                variant="outlined"
                size="large"
                onClick={loadMockData}
                startIcon={<Iconify icon="eva:refresh-fill" />}
                sx={{ height: 56, width: '100%' }}
              >
                Load Mock Data
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Results Section */}
      {results && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Q&A Section */}
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3 }}>
                Questions and Answers
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>No</TableCell>
                      <TableCell>Question</TableCell>
                      <TableCell>Answer</TableCell>
                      <TableCell>Tax Type</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.entries(results.questions).map(([key, value], index) => (
                      <TableRow key={key}>
                        <TableCell>Q{index + 1}</TableCell>
                        <TableCell>{value.question}</TableCell>
                        <TableCell sx={{ bgcolor: 'background.neutral' }}>
                          {value.answer}
                        </TableCell>
                        <TableCell>
                          {value.taxType && (
                            <Chip 
                              label={value.taxType} 
                              size="small" 
                              sx={{ bgcolor: 'warning.main', color: 'white' }}
                            />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>

          {/* Tax Computation Table */}
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, bgcolor: 'primary.main', color: 'white', p: 1, borderRadius: 1 }}>
                Tax Computation
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Computation Items</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>8%</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>OSD (40%)</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>Itemized</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>Sales (net of discount, return, allowances)</TableCell>
                      <TableCell align="right">{formatNumber(results.computations.sales)}</TableCell>
                      <TableCell align="right">{formatNumber(results.computations.sales)}</TableCell>
                      <TableCell align="right">{formatNumber(results.computations.sales)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Less: Allowable Deduction (Expenses)</TableCell>
                      <TableCell align="right" sx={{ color: 'error.main' }}>
                        {formatNumber(results.computations.eightPercent.deduction)}
                      </TableCell>
                      <TableCell align="right" sx={{ color: 'warning.main' }}>
                        {formatNumber(results.computations.osd.deduction)}
                      </TableCell>
                      <TableCell align="right">{formatNumber(results.computations.itemized.deduction)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Taxable Income</TableCell>
                      <TableCell align="right">{formatNumber(results.computations.eightPercent.taxableIncome)}</TableCell>
                      <TableCell align="right">{formatNumber(results.computations.osd.taxableIncome)}</TableCell>
                      <TableCell align="right">{formatNumber(results.computations.itemized.taxableIncome)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Income Tax (0% to 35% of net income)</TableCell>
                      <TableCell align="right">{formatCurrency(results.computations.eightPercent.incomeTax)}</TableCell>
                      <TableCell align="right">{formatCurrency(results.computations.osd.incomeTax)}</TableCell>
                      <TableCell align="right">{formatCurrency(results.computations.itemized.incomeTax)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Percentage Tax (3% of sales) or VAT (12% of Sales)</TableCell>
                      <TableCell align="right">-</TableCell>
                      <TableCell align="right">{formatCurrency(results.computations.osd.percentageTax)}</TableCell>
                      <TableCell align="right">{formatCurrency(results.computations.itemized.percentageTax)}</TableCell>
                    </TableRow>
                    <TableRow sx={{ bgcolor: 'warning.main' }}>
                      <TableCell sx={{ fontWeight: 'bold' }}>Total Annual Tax</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                        {results.computations.eightPercent.eligible ? formatCurrency(results.computations.eightPercent.totalTax) : 'Not Eligible'}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                        {formatCurrency(results.computations.osd.totalTax)}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                        {formatCurrency(results.computations.itemized.totalTax)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>

          {/* Summary Card */}
          <Card sx={{ bgcolor: 'background.paper', color: 'text.primary' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: 'text.primary' }}>
                Tax Decision Summary
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>Recommended tax type:</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                    {results.summary.recommendedTaxType}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>Total Annual Tax:</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                    {formatCurrency(results.summary.totalAnnualTax)}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>Annual Tax Savings:</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                    {formatCurrency(results.summary.annualTaxSavings)}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Box>
      )}
    </DashboardContent>
  );
} 