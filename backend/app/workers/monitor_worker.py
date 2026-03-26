from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
from app.agents.monitor_agent import monitor_agent
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

scheduler = AsyncIOScheduler()


async def _run_monitor():
    logger.info("[MonitorWorker] Running scheduled monitoring cycle...")
    try:
        await monitor_agent({})
    except Exception as e:
        logger.error(f"[MonitorWorker] Error during monitoring: {e}")


def start_scheduler():
    scheduler.add_job(
        _run_monitor,
        trigger=IntervalTrigger(seconds=settings.MONITOR_INTERVAL_SECONDS),
        id="monitor_job",
        replace_existing=True,
    )
    scheduler.start()
    logger.info(
        f"[MonitorWorker] Scheduler started — interval: {settings.MONITOR_INTERVAL_SECONDS}s"
    )


def stop_scheduler():
    if scheduler.running:
        scheduler.shutdown(wait=False)
        logger.info("[MonitorWorker] Scheduler stopped.")
