import streamlit as st
import pandas as pd
import matplotlib.pyplot as plt
from datetime import datetime
import os

from simulator import generate_sensor_data
from detector import detect_breaches
from ai_explainer import get_ai_explanation


# Page configuration
st.set_page_config(
    page_title="Cold Chain Breach Detection",
    page_icon="🌡️",
    layout="wide"
)


def plot_temperature_data(df, breaches):
    """
    Plot temperature data with breach highlighting.
    
    Args:
        df: DataFrame with timestamp and temperature
        breaches: List of breach events
    """
    fig, ax = plt.subplots(figsize=(12, 6))
    
    # Plot temperature line
    ax.plot(df['timestamp'], df['temperature'], 
            linewidth=2, color='#667eea', label='Temperature')
    
    # Add safe range background
    ax.axhspan(2, 8, alpha=0.2, color='green', label='Safe Range (2-8°C)')
    
    # Highlight breach periods
    for breach in breaches:
        ax.axvspan(breach.start_time, breach.end_time, 
                  alpha=0.3, color='red', label='Breach')
    
    # Add reference lines
    ax.axhline(y=2, color='orange', linestyle='--', linewidth=1, alpha=0.7)
    ax.axhline(y=8, color='orange', linestyle='--', linewidth=1, alpha=0.7)
    
    ax.set_xlabel('Time', fontsize=12)
    ax.set_ylabel('Temperature (°C)', fontsize=12)
    ax.set_title('Cold Storage Temperature Monitoring', fontsize=14, fontweight='bold')
    ax.legend(loc='upper right')
    ax.grid(True, alpha=0.3)
    
    plt.xticks(rotation=45)
    plt.tight_layout()
    
    return fig


def get_severity_color(severity):
    """Return color for severity level."""
    colors = {
        'mild': '#f59e0b',      # orange
        'high': '#ef4444',      # red
        'critical': '#7c3aed'   # purple
    }
    return colors.get(severity, '#ef4444')


def main():
    """Main Streamlit application."""
    
    # Header
    st.title("🌡️ Pharmaceutical Cold Chain Breach Detection System")
    st.markdown("---")
    
    # Sidebar for controls
    st.sidebar.header("Configuration")
    
    hours = st.sidebar.slider("Simulation Duration (hours)", 1, 48, 24)
    interval = st.sidebar.slider("Data Interval (minutes)", 1, 30, 5)
    
    st.sidebar.markdown("---")
    st.sidebar.info("""
    **Safe Temperature Range:** 2°C - 8°C
    
    **Severity Levels:**
    - Mild: < 10°C
    - High: 10-15°C  
    - Critical: > 15°C
    """)
    
    # Generate data button
    col1, col2, col3 = st.columns([1, 2, 1])
    with col2:
        generate_btn = st.button("🔄 Generate New Sensor Data", type="primary", use_container_width=True)
    
    # Initialize session state
    if 'df' not in st.session_state or generate_btn:
        with st.spinner("Generating sensor data..."):
            st.session_state.df = generate_sensor_data(hours=hours, interval_minutes=interval)
            st.session_state.breaches = detect_breaches(st.session_state.df)
    
    df = st.session_state.df
    breaches = st.session_state.breaches
    
    # Display statistics
    col1, col2, col3, col4 = st.columns(4)
    with col1:
        st.metric("Data Points", len(df))
    with col2:
        st.metric("Avg Temp", f"{df['temperature'].mean():.1f}°C")
    with col3:
        st.metric("Max Temp", f"{df['temperature'].max():.1f}°C")
    with col4:
        st.metric("Breaches", len(breaches), delta_color="inverse")
    
    st.markdown("---")
    
    # Plot temperature data
    st.subheader("📊 Temperature vs Time Graph")
    fig = plot_temperature_data(df, breaches)
    st.pyplot(fig)
    
    st.markdown("---")
    
    # Display breaches
    st.subheader("🚨 Detected Breaches")
    
    if not breaches:
        st.success("✅ No temperature breaches detected in the monitoring period.")
    else:
        # Show critical breach pop-ups first
        critical_breaches = [b for b in breaches if b.to_dict()['severity'] == 'critical']
        if critical_breaches:
            for breach in critical_breaches:
                breach_data = breach.to_dict()
                st.error(f"🚨 CRITICAL BREACH ALERT: Temperature reached {breach_data['max_temp']:.1f}°C at {breach_data['start_time'].strftime('%Y-%m-%d %H:%M')}")
                st.warning(f"Duration: {breach_data['duration_minutes']:.1f} minutes - Immediate action required!")
        
        # Show all breaches with AI explanations
        for i, breach in enumerate(breaches, 1):
            breach_data = breach.to_dict()
            
            # Severity badge
            severity_color = get_severity_color(breach_data['severity'])
            
            # Expandable breach details
            with st.expander(f"Breach #{i} - {breach_data['severity'].upper()} - {breach_data['start_time'].strftime('%Y-%m-%d %H:%M')}", expanded=True):
                
                col1, col2, col3 = st.columns(3)
                with col1:
                    st.write(f"**Duration:** {breach_data['duration_minutes']:.1f} minutes")
                with col2:
                    st.write(f"**Max Temp:** {breach_data['max_temp']:.1f}°C")
                with col3:
                    st.write(f"**Min Temp:** {breach_data['min_temp']:.1f}°C")
                
                st.markdown("---")
                
                # AI Explanation (always use real API)
                st.write("**🤖 AI Analysis:**")
                
                # Show loading state
                with st.spinner("Generating AI explanation..."):
                    explanation = get_ai_explanation(
                        breach_data['max_temp'],
                        breach_data['duration_minutes'],
                        breach_data['severity']
                    )
                
                st.info(explanation)
    
    st.markdown("---")
    
    # Export functionality
    st.subheader("📥 Export Data")
    col1, col2 = st.columns(2)
    
    with col1:
        csv = df.to_csv(index=False)
        st.download_button(
            label="Download Sensor Data (CSV)",
            data=csv,
            file_name=f'sensor_data_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv',
            mime='text/csv'
        )
    
    with col2:
        if breaches:
            breaches_df = pd.DataFrame([b.to_dict() for b in breaches])
            breaches_csv = breaches_df.to_csv(index=False)
            st.download_button(
                label="Download Breach Report (CSV)",
                data=breaches_csv,
                file_name=f'breach_report_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv',
                mime='text/csv'
            )
    
    # Footer
    st.markdown("---")
    st.markdown("""
    <div style='text-align: center; color: gray; font-size: 0.8em;'>
    Pharmaceutical Cold Chain Breach Detection System | Built with Streamlit & NVIDIA AI
    </div>
    """, unsafe_allow_html=True)


if __name__ == "__main__":
    main()
