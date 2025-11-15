import { storage } from "./storage";
import { hashPassword } from "./auth";

export async function seedDatabase() {
  console.log("Seeding database...");

  try {
    const demoCompany = await storage.createCompany({
      name: "Apex Construction",
    });
    console.log("Created company:", demoCompany.name);

    const hashedPassword = await hashPassword("demo123");
    const demoUser = await storage.createUser({
      username: "demo",
      email: "demo@safetysync.ai",
      password: hashedPassword,
      companyId: demoCompany.id,
    });
    console.log("Created demo user:", demoUser.email);

    const locationA = await storage.createLocation({
      companyId: demoCompany.id,
      name: "Site A - Downtown",
    });

    const locationB = await storage.createLocation({
      companyId: demoCompany.id,
      name: "Site B - Industrial Park",
    });

    const plant1 = await storage.createLocation({
      companyId: demoCompany.id,
      name: "Plant 1",
    });
    console.log("Created locations");

    const employees = [
      {
        companyId: demoCompany.id,
        locationId: locationA.id,
        firstName: "Maria",
        lastName: "Lopez",
        email: "maria.lopez@apex.com",
        role: "Foreman",
        status: "active",
      },
      {
        companyId: demoCompany.id,
        locationId: locationB.id,
        firstName: "James",
        lastName: "Carter",
        email: "james.carter@apex.com",
        role: "Laborer",
        status: "active",
      },
      {
        companyId: demoCompany.id,
        locationId: plant1.id,
        firstName: "Alex",
        lastName: "Nguyen",
        email: "alex.nguyen@apex.com",
        role: "Maintenance Tech",
        status: "active",
      },
      {
        companyId: demoCompany.id,
        locationId: locationA.id,
        firstName: "Sarah",
        lastName: "Johnson",
        email: "sarah.johnson@apex.com",
        role: "Electrician",
        status: "active",
      },
      {
        companyId: demoCompany.id,
        locationId: locationB.id,
        firstName: "Michael",
        lastName: "Chen",
        email: "michael.chen@apex.com",
        role: "Operator",
        status: "active",
      },
    ];

    const createdEmployees = await Promise.all(
      employees.map(emp => storage.createEmployee(emp))
    );
    console.log(`Created ${createdEmployees.length} employees`);

    const today = new Date();
    const futureDate = (daysAhead: number) => {
      const d = new Date(today);
      d.setDate(d.getDate() + daysAhead);
      return d.toISOString().split('T')[0];
    };
    const pastDate = (daysAgo: number) => {
      const d = new Date(today);
      d.setDate(d.getDate() - daysAgo);
      return d.toISOString().split('T')[0];
    };

    const trainingRecords = [
      {
        employeeId: createdEmployees[0].id,
        trainingType: "OSHA 30-Hour Construction",
        oshaStandard: "1926",
        completionDate: pastDate(300),
        expirationDate: futureDate(365),
        provider: "SafetyFirst Training",
        status: "valid",
      },
      {
        employeeId: createdEmployees[1].id,
        trainingType: "OSHA 10-Hour Construction",
        oshaStandard: "1926",
        completionDate: pastDate(350),
        expirationDate: futureDate(14),
        provider: "OSHA Direct",
        status: "valid",
      },
      {
        employeeId: createdEmployees[2].id,
        trainingType: "Lockout/Tagout (LOTO)",
        oshaStandard: "1910.147",
        completionDate: pastDate(400),
        expirationDate: pastDate(30),
        provider: "Industrial Safety Corp",
        status: "expired",
      },
      {
        employeeId: createdEmployees[3].id,
        trainingType: "Electrical Safety",
        oshaStandard: "1910 Subpart S",
        completionDate: pastDate(180),
        expirationDate: futureDate(185),
        provider: "ElectroSafe Training",
        status: "valid",
      },
      {
        employeeId: createdEmployees[4].id,
        trainingType: "Hazard Communication",
        oshaStandard: "1910.1200",
        completionDate: pastDate(90),
        expirationDate: futureDate(275),
        provider: "ChemSafe Inc",
        status: "valid",
      },
      {
        employeeId: createdEmployees[0].id,
        trainingType: "Fall Protection",
        oshaStandard: "1926 Subpart M",
        completionDate: pastDate(200),
        expirationDate: futureDate(165),
        provider: "Heights Safety",
        status: "valid",
      },
      {
        employeeId: createdEmployees[1].id,
        trainingType: "Scaffold Safety",
        oshaStandard: "1926 Subpart L",
        completionDate: pastDate(250),
        expirationDate: futureDate(7),
        provider: "SafetyFirst Training",
        status: "valid",
      },
      {
        employeeId: createdEmployees[3].id,
        trainingType: "Arc Flash Safety",
        oshaStandard: "1910.335",
        completionDate: pastDate(100),
        expirationDate: futureDate(265),
        provider: "ElectroSafe Training",
        status: "valid",
      },
    ];

    await Promise.all(
      trainingRecords.map(record => storage.createTrainingRecord(record))
    );
    console.log(`Created ${trainingRecords.length} training records`);

    console.log("\nDatabase seeded successfully!");
    console.log("\nDemo credentials:");
    console.log("Email: demo@safetysync.ai");
    console.log("Password: demo123");
    
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}
