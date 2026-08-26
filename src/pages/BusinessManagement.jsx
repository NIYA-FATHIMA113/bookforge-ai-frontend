import { useParams } from "react-router-dom";
import ServiceList from "../components/ServiceList";
import BusinessHours from "../components/BusinessHours";
import BookingSection from "../components/BookingSection";




function BusinessManagement() {
  const { tenantId } = useParams();

  return (
    <div>
      <h1>Manage Business</h1>
      <p>Business ID: {tenantId}</p>

      <ServiceList tenantId={tenantId} />

      <h2>Resources</h2>
      <p>Resources will appear here.</p>

      <BusinessHours tenantId={tenantId} />
      <BookingSection tenantId={tenantId} />
    </div>
  );
}

export default BusinessManagement;