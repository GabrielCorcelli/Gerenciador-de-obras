import { extendTheme } from '@chakra-ui/react'

export const theme = extendTheme({
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
  fonts: {
    heading: `'Inter', sans-serif`,
    body: `'Inter', sans-serif`,
  },
  colors: {
    brand: {
      50: '#e0fcff',
      100: '#b3f0ff',
      200: '#81e6d9',
      300: '#4fd1c5',
      400: '#38b2ac',
      500: '#319795',
    },
    navy: {
      400: '#3a4a6b',
      500: '#222d5a',
      600: '#1b254b',
      700: '#111c44',
      800: '#0b1437',
      900: '#070d26',
    },
  },
  styles: {
    global: {
      'html, body, #root': {
        background: 'navy.800',
        color: 'white',
        fontFamily: 'Inter, sans-serif',
        minHeight: '100vh',
      },
      '::-webkit-scrollbar': { width: '6px' },
      '::-webkit-scrollbar-track': { bg: 'navy.700' },
      '::-webkit-scrollbar-thumb': { bg: 'navy.400', borderRadius: '4px' },
    },
  },
  components: {
    Button: {
      variants: {
        brand: {
          bg: 'linear-gradient(97.89deg, #4fd1c5 17.73%, #2b6cb0 100%)',
          color: 'white',
          borderRadius: 'xl',
          fontWeight: '600',
          _hover: {
            bg: 'linear-gradient(97.89deg, #38b2ac 17.73%, #2c5282 100%)',
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 20px rgba(79,209,197,0.4)',
            _disabled: { transform: 'none' },
          },
          _active: { transform: 'translateY(0)' },
        },
        outline: {
          borderColor: 'whiteAlpha.300',
          color: 'white',
          borderRadius: 'xl',
          _hover: { bg: 'whiteAlpha.100', borderColor: 'brand.300' },
        },
        ghost: {
          color: 'whiteAlpha.700',
          borderRadius: 'xl',
          _hover: { bg: 'whiteAlpha.100', color: 'white' },
        },
      },
    },
    Input: {
      variants: {
        filled: {
          field: {
            bg: 'navy.700',
            borderRadius: 'xl',
            border: '1px solid',
            borderColor: 'whiteAlpha.200',
            color: 'white',
            _hover: { bg: 'navy.700', borderColor: 'whiteAlpha.300' },
            _focus: { bg: 'navy.700', borderColor: 'brand.300', boxShadow: '0 0 0 1px #4fd1c5' },
            _placeholder: { color: 'whiteAlpha.400' },
          },
        },
      },
      defaultProps: { variant: 'filled' },
    },
    Select: {
      variants: {
        filled: {
          field: {
            bg: 'navy.700',
            borderRadius: 'xl',
            border: '1px solid',
            borderColor: 'whiteAlpha.200',
            color: 'white',
            _hover: { bg: 'navy.700', borderColor: 'whiteAlpha.300' },
            _focus: { bg: 'navy.700', borderColor: 'brand.300', boxShadow: '0 0 0 1px #4fd1c5' },
          },
        },
      },
      defaultProps: { variant: 'filled' },
    },
    Textarea: {
      variants: {
        filled: {
          bg: 'navy.700',
          borderRadius: 'xl',
          border: '1px solid',
          borderColor: 'whiteAlpha.200',
          color: 'white',
          _hover: { bg: 'navy.700', borderColor: 'whiteAlpha.300' },
          _focus: { bg: 'navy.700', borderColor: 'brand.300', boxShadow: '0 0 0 1px #4fd1c5' },
          _placeholder: { color: 'whiteAlpha.400' },
        },
      },
      defaultProps: { variant: 'filled' },
    },
    Modal: {
      baseStyle: {
        dialog: { bg: 'navy.700', borderRadius: '2xl' },
        header: { borderBottom: '1px solid', borderColor: 'whiteAlpha.100' },
        footer: { borderTop: '1px solid', borderColor: 'whiteAlpha.100' },
      },
    },
    Table: {
      variants: {
        obra: {
          th: { color: 'whiteAlpha.500', fontWeight: '600', fontSize: 'xs', textTransform: 'uppercase', letterSpacing: 'wider', borderColor: 'whiteAlpha.100' },
          td: { borderColor: 'whiteAlpha.100' },
        },
      },
    },
  },
})
