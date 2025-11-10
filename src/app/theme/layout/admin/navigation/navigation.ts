export interface NavigationItem {
  id: string;
  title: string;
  type: 'item' | 'collapse' | 'group';
  translate?: string;
  icon?: string;
  hidden?: boolean;
  url?: string;
  classes?: string;
  exactMatch?: boolean;
  external?: boolean;
  target?: boolean;
  breadcrumbs?: boolean;

  children?: NavigationItem[];
}
export const NavigationItems: NavigationItem[] = [
  {
    id: 'navigation',
    title: 'Navegación',
    type: 'group',
    icon: 'icon-navigation',
    children: [
      {
        id: 'dashboard',
        title: 'Dashboard',
        type: 'item',
        url: '/admin//dashboard',
        icon: 'feather icon-home',
        classes: 'nav-item'
      }
    ]
  },
  {
    id: 'ui-element',
    title: 'Usuarios',
    type: 'group',
    icon: 'icon-ui',
    children: [
      {
        id: 'basic',
        title: 'Component',
        type: 'collapse',
        icon: 'feather icon-box',
        children: [
          {
            id: 'button',
            title: 'Button',
            type: 'item',
            url: '/admin/basic/button'
          },
          {
            id: 'badges',
            title: 'Badges',
            type: 'item',
            url: '/admin/basic/badges'
          },
          {
            id: 'breadcrumb-pagination',
            title: 'Breadcrumb & Pagination',
            type: 'item',
            url: '/admin/basic/breadcrumb-paging'
          },
          {
            id: 'collapse',
            title: 'Collapse',
            type: 'item',
            url: '/basic/collapse'
          },
          {
            id: 'tabs-pills',
            title: 'Tabs & Pills',
            type: 'item',
            url: '/admin/basic/tabs-pills'
          },
          {
            id: 'typography',
            title: 'Typography',
            type: 'item',
            url: '/admin/basic/typography'
          }
        ]
      },
       {
        id: 'tables',
        title: 'Usuario',
        type: 'item',
        url: '/admin/usuarios',
        classes: 'nav-item',
        icon: 'feather icon-file-text'
      }
    ]
  },
  {
    id: 'forms',
    title: 'Modulo Administración',
    type: 'group',
    icon: 'icon-group',
    children: [
      {
        id: 'basic',
        title: 'Administración Instituto',
        type: 'collapse',
        icon: 'feather icon-box',
        children: [
          {
            id: 'button',
            title: 'Carreras',
            type: 'item',
            url: '/admin/carreras'
          },
                    {
            id: 'button',
            title: 'Cursos',
            type: 'item',
            url: '/admin/grupos'
          },
                    {
            id: 'button',
            title: 'Materias',
            type: 'item',
            url: '/admin/materias'
          },
          {
            id: 'badges',
            title: 'Modalidad',
            type: 'item',
            url: '/admin/modalidades'
          },
          {
            id: 'tabs-pills',
            title: 'Malla Curricular',
            type: 'item',
            url: '/admin/basic/tabs-pills'
          },
          {
            id: 'typography',
            title: 'Periodo Academico',
            type: 'item',
            url: '/admin/periodosAcademicos'
          }
        ]
      },
            {
        id: 'forms-element',
        title: 'Estudiantes',
        type: 'item',
        url: '/admin/estudiantes',
        classes: 'nav-item',
        icon: 'feather icon-file-text'
      },
      {
        id: 'tables',
        title: 'Profesores',
        type: 'item',
        url: '/admin/tables',
        classes: 'nav-item',
        icon: 'feather icon-server'
      },
      {
        id: 'forms-element',
        title: 'Form Elements',
        type: 'item',
        url: '/admin/forms',
        classes: 'nav-item',
        icon: 'feather icon-file-text'
      },
      {
        id: 'tables',
        title: 'Tables',
        type: 'item',
        url: '/admin/tables',
        classes: 'nav-item',
        icon: 'feather icon-server'
      }
    ]
  },
  {
    id: 'chart-maps',
    title: 'Cajas',
    type: 'group',
    icon: 'icon-charts',
    children: [
      {
        id: 'apexChart',
        title: 'ApexChart',
        type: 'item',
        url: '/admin/apexchart',
        classes: 'nav-item',
        icon: 'feather icon-pie-chart'
      },
      {
        id: 'apexChart',
        title: 'Ingresos',
        type: 'item',
        url: '/admin/apexchart',
        classes: 'nav-item',
        icon: 'feather icon-pie-chart'
      },
       {
        id: 'apexChart',
        title: 'Egresos',
        type: 'item',
        url: '/admin/apexchart',
        classes: 'nav-item',
        icon: 'feather icon-pie-chart'
      }
    ]
  },
  {
    id: 'pages',
    title: 'Pages',
    type: 'group',
    icon: 'icon-pages',
    children: [
      {
        id: 'auth',
        title: 'Authentication',
        type: 'collapse',
        icon: 'feather icon-lock',
        children: [
          {
            id: 'signup',
            title: 'Sign up',
            type: 'item',
            url: '/admin/register',
            target: true,
            breadcrumbs: false
          },
          {
            id: 'signin',
            title: 'Sign in',
            type: 'item',
            url: '/admin/login',
            target: true,
            breadcrumbs: false
          }
        ]
      },
      {
        id: 'sample-page',
        title: 'Sample Page',
        type: 'item',
        url: '/admin/sample-page',
        classes: 'nav-item',
        icon: 'feather icon-sidebar'
      },
      {
        id: 'disabled-menu',
        title: 'Disabled Menu',
        type: 'item',
        url: 'javascript:',
        classes: 'nav-item disabled',
        icon: 'feather icon-power',
        external: true
      },
      {
        id: 'buy_now',
        title: 'Buy Now',
        type: 'item',
        icon: 'feather icon-book',
        classes: 'nav-item',
        url: 'https://codedthemes.com/item/datta-able-angular/',
        target: true,
        external: true
      }
    ]
  }
];
