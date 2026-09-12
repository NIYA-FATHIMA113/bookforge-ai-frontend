import { useParams } from "react-router-dom";

import ServiceList from "../components/ServiceList";
import Resources from "./Resources";
import BusinessHours from "../components/BusinessHours";
import BookingSection from "../components/BookingSection";

function BusinessManagement() {
  const { tenantId } = useParams();

  return (
    <div className="business-management">

      <header className="business-management-header">
        <h1>Manage Business</h1>

        <p>
          Manage your services, resources,
          business hours, and bookings.
        </p>
      </header>

      {/* Services */}
      <section>
        <ServiceList tenantId={tenantId} />
      </section>

      {/* Resources */}
      <section>
        <Resources tenantId={tenantId} />
      </section>

      {/* Business Hours */}
      <section>
        <BusinessHours tenantId={tenantId} />
      </section>

      {/* Bookings */}
      <section>
        <BookingSection tenantId={tenantId} />
      </section>

    </div>
  );
}

export default BusinessManagement;