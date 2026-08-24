import { prisma } from '../../utils/prisma';
import { AppError } from '../../middleware/error-handler';

export interface CreateCompanyParams {
  name: string;
  website?: string;
  industry?: string;
  description?: string;
  companySize?: string;
  headquarters?: string;
  foundedYear?: number;
  logo?: string;
}

export class CompanyService {
  private slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  async createCompany(params: CreateCompanyParams) {
    const slug = this.slugify(params.name);

    const existing = await prisma.company.findFirst({
      where: { OR: [{ name: params.name }, { slug }] },
    });

    if (existing) {
      throw new AppError('Company with this name or slug already exists', 409, 'COMPANY_EXISTS');
    }

    const company = await prisma.company.create({
      data: {
        name: params.name,
        slug,
        website: params.website || null,
        industry: params.industry || null,
        description: params.description || null,
        companySize: params.companySize || null,
        headquarters: params.headquarters || null,
        foundedYear: params.foundedYear || null,
        logo: params.logo || null,
        verified: false,
      },
    });

    return company;
  }

  async getCompanyBySlug(slug: string) {
    const company = await prisma.company.findUnique({
      where: { slug },
      include: {
        jobs: {
          where: { status: 'OPEN' },
          orderBy: { createdAt: 'desc' },
        },
        recruiters: {
          include: {
            user: { select: { id: true, email: true, avatarUrl: true } },
          },
        },
      },
    });

    if (!company) {
      throw new AppError('Company not found', 404, 'COMPANY_NOT_FOUND');
    }

    return company;
  }

  async getVerifiedCompanies(page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.company.findMany({
        where: { verified: true },
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        include: {
          _count: { select: { jobs: true } },
        },
      }),
      prisma.company.count({ where: { verified: true } }),
    ]);

    return {
      items,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async adminVerifyCompany(companyId: string, verified: boolean) {
    const company = await prisma.company.findUnique({ where: { id: companyId } });
    if (!company) {
      throw new AppError('Company not found', 404, 'COMPANY_NOT_FOUND');
    }

    return prisma.company.update({
      where: { id: companyId },
      data: { verified },
    });
  }
}

export const companyService = new CompanyService();
